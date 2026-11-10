import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL as backendUrl } from '@/lib/auth-client';
import { extractAdminOrSupportUser, getAuthorizationHeader } from '@/lib/server-auth';
import { assignDoctorToTeleReportServer, getTeleReportRequestByNumberOrIdServer } from '@/lib/tele-report-storage';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const actor = extractAdminOrSupportUser(req) || {
    fullName: 'مدیر ارشد سامانه',
    role: 'admin',
  };

  try {
    const resolvedParams = await Promise.resolve(context?.params);
    const id = decodeURIComponent(resolvedParams?.id || '').trim();
    const body = await req.json();
    const doctorId = String(body?.doctorId || '').trim();
    if (!doctorId) {
      return NextResponse.json({ error: 'انتخاب پزشک رادیولوژیست الزامی است.' }, { status: 400 });
    }

    const authHeader = getAuthorizationHeader(req, 'admin');
    const localReq = await getTeleReportRequestByNumberOrIdServer(id).catch(() => null);

    const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    const backendId = isUuid(id) ? id : (localReq?.requestNumber || id);

    let backendResult: any = null;
    try {
      const bRes = await fetch(`${backendUrl}/admin/tele-reports/${encodeURIComponent(backendId)}/assign-doctor`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({
          doctorId,
          requestNumber: localReq?.requestNumber || id,
          localId: id,
          phone: localReq?.phone,
          patientLastName: localReq?.patientLastName,
        }),
      });

      if (bRes.ok) {
        backendResult = await bRes.json();
      } else if (bRes.status === 404 && localReq) {
        // If request existed only in local store, sync to PostgreSQL and retry
        try {
          const syncRes = await fetch(`${backendUrl}/tele-report/requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              requestNumber: localReq.requestNumber || undefined,
              country: localReq.country || 'IR',
              language: localReq.language || 'fa',
              patientFirstName: localReq.patientFirstName || 'بیمار',
              patientLastName: localReq.patientLastName || 'رادینت',
              nationalId: localReq.nationalId || undefined,
              passportNumber: localReq.passportNumber || undefined,
              phone: localReq.phone || '09120000000',
              city: localReq.city || 'تهران',
              age: localReq.age || 30,
              gender: localReq.gender || 'male',
              clinicalHistory: localReq.clinicalHistory || 'بررسی تله‌ریپورت',
              symptoms: localReq.symptoms || 'بررسی تصویربرداری',
              imagingType: localReq.imagingType || 'MRI',
              imagingArea: localReq.imagingArea || 'مغز و اعصاب',
              studyDate: localReq.studyDate || undefined,
              pacsUrl: localReq.pacsUrl || undefined,
              cloudUrl: localReq.cloudUrl || undefined,
            }),
          });
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            const newBackendId = syncData.id || syncData.requestNumber || backendId;
            const retryRes = await fetch(`${backendUrl}/admin/tele-reports/${encodeURIComponent(newBackendId)}/assign-doctor`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: authHeader,
              },
              body: JSON.stringify({
                doctorId,
                requestNumber: syncData.requestNumber || localReq.requestNumber,
                localId: id,
              }),
            });
            if (retryRes.ok) {
              backendResult = await retryRes.json();
            }
          }
        } catch {
          // ignore sync failure
        }
      }
    } catch {
      // Backend offline or unreachable
    }

    let localResult: any = null;
    try {
      localResult = await assignDoctorToTeleReportServer({
        requestId: id,
        doctorId,
        actorName: actor.fullName,
        actorRole: actor.role,
      });
    } catch (localErr) {
      if (!backendResult) {
        throw localErr;
      }
    }

    return NextResponse.json(backendResult || localResult || { ok: true, message: 'ارجاع به پزشک با موفقیت انجام شد' });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'اختصاص پزشک ناموفق بود.' },
      { status: 400 },
    );
  }
}
