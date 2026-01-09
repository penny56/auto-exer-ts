import {test, expect } from '@playwright/test'

test.beforeEach(async ({ page }, testInfo) => {
    console.log('>>> Str to -------> ', testInfo.title)

    await page.goto("https://www.automationexercise.com/")
    // 至少加载一个商品
    await page.waitForSelector('.product-image-wrapper', { state: 'visible' })
});

test.afterEach(async ({ page }, testInfo) => {
    console.log('=== End of =======> ', testInfo.title)
});

test.describe('No session', () => {

    test.use({ storageState: undefined })

    test('5.1 Add review on product', async ({ page }) => {
        /* 1. 查看产品详情页 → 2. 写评论（名字、邮箱、评价内容） → 3. 提交 → 4. 验证 “Thank you for your review.” 成功提示 */
        // 1. 查看产品详情页
        await page.getByRole('link', {name: 'View Product'}).first().click()
        await expect(page.locator('div.product-details')).toBeVisible()

        // 2. 写评论（名字、邮箱、评价内容）
        await page.locator('#name').fill('Matt')
        await page.locator('#email').fill('matt@any')
        await page.locator('#review').fill('this is content.')
        await page.locator('#button-review').click()

        // 4. 验证 “Thank you for your review.” 成功提示
        await expect(page.getByText('Thank you for your review.')).toBeVisible()
    });

    test('5.2 Add to cart from Recommended items', async ({ page }) => {
        /* 1. 滚动到页面底部 → 2. 在 “RECOMMENDED ITEMS” 部分点击 “Add To Cart” → 3. 查看购物车 → 4. 验证该推荐商品是否已加入购物车 */
        // 1. 滚动到页面底部
        const recommend = page.locator('div.recommended_items')
        await recommend.waitFor({ state: 'visible' })
        await recommend.scrollIntoViewIfNeeded()

        // 2. 在 “RECOMMENDED ITEMS” 部分点击 “Add To Cart”
        const activeRecommends = page.locator('#recommended-item-carousel').locator('div.item.active')

        // 这个 “RECOMMENDED ITEMS” 是：Bootstrap carousel（轮播图）
        await activeRecommends.first().locator('a:has-text("Add to cart")').first().click()

        // 3. 查看购物车
        await page.getByText('View Cart').click()
        await page.locator('#cart_info_table').waitFor({state: 'visible'})

        // 4. 验证该推荐商品是否已加入购物车
        const tbody = page.locator('tbody')
        const rows = tbody.locator('tr')
        const rowCnt = await rows.count()
        expect(rowCnt).toBeGreaterThan(0)
    });

    test('5.3 Verify Subscription in home page / cart page', async ({ page }) => {
        /* 1. 在首页或购物车页底部订阅输入邮箱 → 2. 点击提交 → 3. 验证订阅成功消息是否显示 */
        let email = page.locator('#susbscribe_email')
        await email.fill('ss@any')
        await page.locator('#subscribe').click()
        await expect(page.getByText('You have been successfully subscribed!')).toBeVisible()

        // 进入 Cart 页面
        await page.locator('div.shop-menu').getByText('Cart').click()
        await page.locator('#cart_info').waitFor( {state: 'visible'} )

        email = page.locator('#susbscribe_email')
        await email.fill('ss@any')
        await page.locator('#subscribe').click()
        await expect(page.getByText('You have been successfully subscribed!')).toBeVisible()   
    });

    test('5.4 Verify Scroll Up using Arrow button and Scroll Down functionality', async ({ page }) => {
        /* 从首页滚动到底部 → 点击页面右下角的“箭头”按钮 → 验证页面滚到顶部 + 顶部内容可见 */
        // 1️. 滚动到底部
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

        // 等待页面底部某个元素可见（可选，确保已经到底部）
        const footer = page.locator('footer') 
        await expect(footer).toBeVisible()

        // 2️. 点击右下角的“到顶箭头”按钮
        const arrowButton = page.locator('#scrollUp') // 替换为真实选择器
        await expect(arrowButton).toBeVisible()
        await arrowButton.click()

        // 3️. 等待页面真正滚到顶部 + 顶部内容可见

        /*
        这里使用： 
        expect.poll().toBe(0) 是因为：等到某个状态真的发生，常用在：动画、流动、状态渐变、异步刷新。。。
        
        不能使用：
        expect(scrollY).toBe(0) 是因为：这是一次性检查，无法用于上述情况。
        */
        await expect.poll(async () => {
            return await page.evaluate(() => window.scrollY)
        }).toBe(0)
        
        // 等待顶部元素可见
        const topElement = page.locator('header') // 或者首页最顶部的标识性元素
        await expect(topElement).toBeVisible()
    });

    test('5.5 Verify Scroll Up without Arrow button and Scroll Down functionality', async ({ page }) => {
        /* 滚动到底部 → 不使用箭头，直接手动滚动回顶部 → 验证顶部内容显示正确 */
    });
});
