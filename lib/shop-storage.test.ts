import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  adminCreateShopProductServer,
  adminDeleteReviewServer,
  adminDeleteShopProductServer,
  adminListReviewsServer,
  adminUpdateReviewStatusServer,
  createProductReviewServer,
  createShopOrderServer,
  getApprovedProductReviewsServer,
  validateCartItemsServer,
} from './shop-storage';

describe('Next.js Shop Storage & Review Moderation E2E Tests', () => {
  it('enforces maxOrderQty in validateCartItemsServer and createShopOrderServer, and manages review lifecycle', async () => {
    // 1. Create a product with maxOrderQty = 2
    const product = await adminCreateShopProductServer({
      name: 'پروب تست سقف خرید',
      slug: `test-max-qty-${Date.now()}`,
      price: 1500000,
      stock: 10,
      maxOrderQty: 2,
      brand: 'Radinet Test',
      sku: `SKU-TEST-${Date.now()}`,
      imageUrl: '/uploads/products/test-probe.png',
    });

    try {
      assert.equal(product.maxOrderQty, 2);

      // 2. Validate cart within maxOrderQty (quantity = 2) -> valid
      const okCheck = await validateCartItemsServer([{ productId: product.id, quantity: 2 }]);
      assert.equal(okCheck.valid, true);

      // 3. Validate cart exceeding maxOrderQty (quantity = 3) -> rejected
      const overCheck = await validateCartItemsServer([{ productId: product.id, quantity: 3 }]);
      assert.equal(overCheck.valid, false);
      assert.match(overCheck.message ?? '', /حداکثر تعداد مجاز خرید/);

      // 4. Validate duplicate split items exceeding maxOrderQty (1 + 2 = 3 > 2) -> rejected
      const splitCheck = await validateCartItemsServer([
        { productId: product.id, quantity: 1 },
        { productId: product.id, quantity: 2 },
      ]);
      assert.equal(splitCheck.valid, false);

      // 5. Ensure createShopOrderServer throws when exceeding maxOrderQty
      await assert.rejects(
        () =>
          createShopOrderServer({
            customerName: 'کاربر تست',
            customerPhone: '09120000000',
            shippingAddress: 'تهران',
            items: [{ productId: product.id, quantity: 3 }],
          }),
        /حداکثر تعداد مجاز خرید/,
      );

      // 6. Submit a user review -> must be saved as 'pending' and NOT appear in public approved list
      const createdRev = await createProductReviewServer({
        userId: 'user-test-99',
        userName: 'مهندس رضایی',
        userEmail: 'rezaei@radinet.ir',
        productIdOrSlug: product.slug,
        rating: 5,
        content: 'پروب بسیار باکیفیت و تصویربرداری شفاف.',
      });
      assert.equal(createdRev.status, 'pending');

      const publicBeforeApproval = await getApprovedProductReviewsServer(product.slug);
      assert.equal(
        publicBeforeApproval.items.some((r) => r.id === createdRev.id),
        false,
        'Pending review must not be returned in public approved reviews',
      );

      // 7. Admin lists pending reviews -> sees the newly submitted review
      const adminPending = await adminListReviewsServer({ status: 'pending' });
      assert.equal(
        adminPending.items.some((r) => r.id === createdRev.id),
        true,
        'Admin must see pending review in moderation list',
      );

      // 8. Admin approves the review -> now appears in public approved list
      await adminUpdateReviewStatusServer(createdRev.id, {
        status: 'approved',
        reviewedBy: 'مدیر تست',
      });
      const publicAfterApproval = await getApprovedProductReviewsServer(product.slug);
      assert.equal(
        publicAfterApproval.items.some((r) => r.id === createdRev.id),
        true,
        'Approved review must appear on product page',
      );

      // 9. Admin rejects the review -> hidden from public approved list
      await adminUpdateReviewStatusServer(createdRev.id, {
        status: 'rejected',
        rejectReason: 'تست رد نظر',
        reviewedBy: 'مدیر تست',
      });
      const publicAfterReject = await getApprovedProductReviewsServer(product.slug);
      assert.equal(
        publicAfterReject.items.some((r) => r.id === createdRev.id),
        false,
        'Rejected review must not appear on product page',
      );

      // 10. Admin deletes the review -> removed completely
      const deleted = await adminDeleteReviewServer(createdRev.id);
      assert.equal(deleted, true);
    } finally {
      await adminDeleteShopProductServer(product.id);
    }
  });
});
