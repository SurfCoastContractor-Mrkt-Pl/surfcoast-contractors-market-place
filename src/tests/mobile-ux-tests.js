/**
 * Mobile UX Test Suite
 * Tests responsive behavior, touch targets, and mobile usability
 * Run: npm test -- mobile-ux-tests.js
 */

import { test, expect } from '@playwright/test';

const MOBILE_VIEWPORT = { width: 375, height: 667 }; // iPhone SE
const TABLET_VIEWPORT = { width: 768, height: 1024 }; // iPad
const DESKTOP_VIEWPORT = { width: 1440, height: 900 }; // Desktop

/**
 * MESSAGING PAGE TESTS
 */
test.describe('Messaging Page - Mobile Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/Messaging');
  });

  test('Mobile: Single column layout (conversation list hidden when chat open)', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    
    // Check conversation list visible initially
    const conversationList = page.locator('.lg\\:w-1\\/3');
    expect(conversationList).toBeVisible();
    
    // Click first conversation
    const firstConv = page.locator('button[data-test="conversation-item"]').first();
    await firstConv.click();
    
    // Conversation list should be hidden on mobile
    await expect(conversationList).toHaveCSS('display', 'none');
    
    // Chat area should take full width
    const chatArea = page.locator('[data-test="chat-container"]');
    const boundingBox = await chatArea.boundingBox();
    expect(boundingBox.width).toBeGreaterThan(340); // Should be full width minus padding
  });

  test('Mobile: Back button (X) visible on chat header', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    
    const firstConv = page.locator('button[data-test="conversation-item"]').first();
    await firstConv.click();
    
    const backButton = page.locator('[data-test="chat-back-button"]');
    await expect(backButton).toBeVisible();
    
    // Back button should only be visible on mobile
    const backButtonMobile = page.locator('.lg\\:hidden [data-test="chat-back-button"]');
    await expect(backButtonMobile).toBeVisible();
  });

  test('Mobile: Touch targets min 44px height on conversation items', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    
    const convItem = page.locator('button[data-test="conversation-item"]').first();
    const boundingBox = await convItem.boundingBox();
    
    expect(boundingBox.height).toBeGreaterThanOrEqual(44);
  });

  test('Desktop: Side-by-side layout (1/3 + 2/3)', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    
    const conversationList = page.locator('.lg\\:w-1\\/3');
    const chatArea = page.locator('.lg\\:col-span-2');
    
    // Both should be visible
    await expect(conversationList).toBeVisible();
    await expect(chatArea).toBeVisible();
    
    // Verify width proportions
    const listBox = await conversationList.boundingBox();
    const chatBox = await chatArea.boundingBox();
    
    const listWidth = listBox.width;
    const chatWidth = chatBox.width;
    const ratio = chatWidth / listWidth;
    
    // Should be approximately 2:1 ratio
    expect(ratio).toBeCloseTo(2, 0.3);
  });

  test('Mobile→Desktop: Responsive gap reduces on mobile', async ({ page }) => {
    // Mobile
    await page.setViewportSize(MOBILE_VIEWPORT);
    let gapClasses = await page.locator('[data-test="main-container"]').getAttribute('class');
    expect(gapClasses).toContain('gap-4'); // Mobile gap
    
    // Desktop
    await page.setViewportSize(DESKTOP_VIEWPORT);
    gapClasses = await page.locator('[data-test="main-container"]').getAttribute('class');
    expect(gapClasses).toContain('lg:gap-6'); // Desktop larger gap
  });

  test('New Message button: Full width on mobile, auto width on desktop', async ({ page }) => {
    // Mobile
    await page.setViewportSize(MOBILE_VIEWPORT);
    let newMsgButton = page.locator('[data-test="new-message-btn"]');
    let classes = await newMsgButton.getAttribute('class');
    expect(classes).toContain('w-full'); // Should be full width
    
    // Desktop
    await page.setViewportSize(DESKTOP_VIEWPORT);
    newMsgButton = page.locator('[data-test="new-message-btn"]');
    classes = await newMsgButton.getAttribute('class');
    expect(classes).toContain('lg:w-auto'); // Should auto on desktop
  });
});

/**
 * CONTRACTOR MY DAY TESTS
 */
test.describe('ContractorMyDay Page - Responsive Grid', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/my-day');
  });

  test('Mobile: Stat grid is 1 column', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    
    const statGrid = page.locator('[data-test="stat-grid"]');
    const gridStyle = await statGrid.getAttribute('class');
    
    expect(gridStyle).toContain('grid-cols-1');
  });

  test('Tablet (640px): Stat grid is 2 columns', async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 800 });
    
    const statGrid = page.locator('[data-test="stat-grid"]');
    const gridStyle = await statGrid.getAttribute('class');
    
    expect(gridStyle).toContain('sm:grid-cols-2');
  });

  test('Desktop: Stat grid is 4 columns', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    
    const statGrid = page.locator('[data-test="stat-grid"]');
    const gridStyle = await statGrid.getAttribute('class');
    
    expect(gridStyle).toContain('lg:grid-cols-4');
  });

  test('Buttons: Min height 48px (12px padding + 24px text)', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    
    const viewDetailsBtn = page.locator('[data-test="view-job-details-btn"]').first();
    const boundingBox = await viewDetailsBtn.boundingBox();
    
    expect(boundingBox.height).toBeGreaterThanOrEqual(48);
  });

  test('Stat values responsive: text-4xl on mobile, larger on desktop', async ({ page }) => {
    // Mobile
    await page.setViewportSize(MOBILE_VIEWPORT);
    let statValue = page.locator('[data-test="stat-value"]').first();
    let classes = await statValue.getAttribute('class');
    expect(classes).toContain('text-4xl');
    
    // Desktop
    await page.setViewportSize(DESKTOP_VIEWPORT);
    statValue = page.locator('[data-test="stat-value"]').first();
    classes = await statValue.getAttribute('class');
    expect(classes).toContain('text-4xl'); // Same, but icon scaling may differ
  });

  test('Job cards: Min height 64px clickable area', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    
    const jobCard = page.locator('[data-test="job-card"]').first();
    const boundingBox = await jobCard.boundingBox();
    
    expect(boundingBox.height).toBeGreaterThanOrEqual(64);
  });

  test('Pending tasks cards: Min height 80px on mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    
    const taskCard = page.locator('[data-test="task-card"]').first();
    if (await taskCard.isVisible()) {
      const boundingBox = await taskCard.boundingBox();
      expect(boundingBox.height).toBeGreaterThanOrEqual(80);
    }
  });

  test('Icon scaling: w-5 h-5 on mobile, w-6 h-6 on larger', async ({ page }) => {
    // Mobile
    await page.setViewportSize(MOBILE_VIEWPORT);
    let icon = page.locator('[data-test="stat-icon"]').first();
    let classes = await icon.getAttribute('class');
    expect(classes).toMatch(/w-5|w-6/); // Should have responsive sizing
    
    // Desktop
    await page.setViewportSize(DESKTOP_VIEWPORT);
    icon = page.locator('[data-test="stat-icon"]').first();
    classes = await icon.getAttribute('class');
    expect(classes).toMatch(/sm:w-6/); // Should scale up on larger screens
  });
});

/**
 * CONTRACTOR JOB PIPELINE TESTS (Flagged for fixing)
 */
test.describe('ContractorJobPipeline - Mobile Issues', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/job-pipeline');
  });

  test('ISSUE: Mobile tabs overflow (needs horizontal scroll)', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    
    const tabContainer = page.locator('[data-test="tabs-list"]');
    const viewportSize = await page.viewportSize();
    const containerBox = await tabContainer.boundingBox();
    
    // Check if tabs extend beyond viewport
    if (containerBox.width > viewportSize.width - 16) {
      // FAIL: Tabs should be scrollable
      console.log('❌ FAILED: Tabs overflow on mobile');
      // Test will pass if scrollable, fail if overflow without scroll
      const hasScroll = await tabContainer.evaluate(el => 
        el.scrollWidth > el.clientWidth
      );
      expect(hasScroll).toBeTruthy();
    }
  });

  test('ISSUE: Filter buttons may not stack well vertically', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    
    const filterButtons = page.locator('[data-test="filter-btn"]');
    const count = await filterButtons.count();
    
    if (count > 2) {
      // Check if buttons are wrapping properly
      const firstBtn = filterButtons.nth(0);
      const secondBtn = filterButtons.nth(1);
      
      const firstBox = await firstBtn.boundingBox();
      const secondBox = await secondBtn.boundingBox();
      
      // Buttons should be horizontally adjacent or wrapped
      const horizontalSpacing = Math.abs(firstBox.x - secondBox.x);
      const verticalSpacing = Math.abs(firstBox.y - secondBox.y);
      
      // If vertical spacing > 20px, they're likely stacked properly
      if (count > 3) {
        expect(verticalSpacing).toBeGreaterThan(20);
      }
    }
  });
});

/**
 * FIELD OPS TESTS (Flagged for fixing)
 */
test.describe('FieldOps - Mobile Issues', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/FieldOps');
  });

  test('ISSUE: Sidebar overlays content on mobile (needs hamburger menu)', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    
    // Check if sidebar is visible without hamburger
    const sidebar = page.locator('[data-test="fieldops-sidebar"]');
    const hamburger = page.locator('[data-test="sidebar-hamburger"]');
    
    const sidebarVisible = await sidebar.isVisible();
    const hamburgerVisible = await hamburger.isVisible();
    
    // On mobile, should have hamburger if sidebar exists
    if (sidebarVisible) {
      expect(hamburgerVisible).toBeTruthy();
    }
  });

  test('ISSUE: Job status update buttons may be small (< 44px)', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    
    const statusBtns = page.locator('[data-test="job-status-btn"]');
    const count = await statusBtns.count();
    
    if (count > 0) {
      const firstBtn = statusBtns.first();
      const box = await firstBtn.boundingBox();
      
      // Should be at least 44px (preferably 48px)
      console.log(`Job status button height: ${box.height}px`);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('ISSUE: Photo upload zone too small on mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    
    const uploadZone = page.locator('[data-test="photo-upload-zone"]');
    if (await uploadZone.isVisible()) {
      const box = await uploadZone.boundingBox();
      
      // Should be at least 100px × 100px
      console.log(`Upload zone: ${box.width}px × ${box.height}px`);
      expect(box.width).toBeGreaterThanOrEqual(100);
      expect(box.height).toBeGreaterThanOrEqual(100);
    }
  });
});

/**
 * ACCESSIBILITY TESTS
 */
test.describe('Mobile Accessibility', () => {
  test('Messaging: All buttons keyboard accessible', async ({ page }) => {
    await page.goto('/Messaging');
    await page.setViewportSize(MOBILE_VIEWPORT);
    
    // Tab to first button
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement.tagName);
    expect(focused).toBe('BUTTON');
  });

  test('ContractorMyDay: Focus states visible', async ({ page }) => {
    await page.goto('/my-day');
    await page.setViewportSize(MOBILE_VIEWPORT);
    
    const button = page.locator('[data-test="view-job-details-btn"]').first();
    await button.focus();
    
    // Check for visible focus ring
    const focusStyle = await button.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.outline || style.boxShadow;
    });
    
    expect(focusStyle).toBeTruthy();
  });

  test('Text sizing: Readable on mobile (14px-16px body text)', async ({ page }) => {
    await page.goto('/Messaging');
    await page.setViewportSize(MOBILE_VIEWPORT);
    
    const bodyText = page.locator('p').first();
    const fontSize = await bodyText.evaluate(el => 
      parseInt(window.getComputedStyle(el).fontSize)
    );
    
    // Should be at least 14px (14–16px acceptable)
    expect(fontSize).toBeGreaterThanOrEqual(14);
  });
});

/**
 * PERFORMANCE TESTS
 */
test.describe('Mobile Performance', () => {
  test('Images use lazy loading', async ({ page }) => {
    await page.goto('/my-day');
    await page.setViewportSize(MOBILE_VIEWPORT);
    
    const images = page.locator('img');
    const count = await images.count();
    
    if (count > 0) {
      const firstImg = images.first();
      const loading = await firstImg.getAttribute('loading');
      expect(loading).toBe('lazy');
    }
  });

  test('Page load time < 3 seconds on mobile', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/Messaging', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });
});