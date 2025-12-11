import {test, expect } from '@playwright/test'

test.beforeEach(async ({ page }, testInfo) => {
    console.log('>>> Str to -------> ', testInfo.title)
});

test.afterEach(async ({ page }, testInfo) => {
    console.log('=== End of =======> ', testInfo.title)
});

test.describe('No session', () => {

    test.use({ storageState: undefined })

    test.beforeEach(async ({ page }) => {
        // inside 'No session'
        await page.goto("https://www.automationexercise.com/products", { waitUntil: "domcontentloaded" })
        // 至少加载一个商品
        await page.waitForSelector('.product-image-wrapper', { state: 'visible' })

    });

    test('3.1 verify all products and product detail page', async ({ page }) => {
        /* 点击 Products → 查看所有产品 → 选择某产品 → 查看产品详情页，并验证名称/分类/价格/库存/品牌/状态等信息 */
        const products = page.locator('div.product-image-wrapper')
        for (let i=0; i<3; i++) {
            const product = products.nth(i)
            const productName = await product.locator('div.productinfo.text-center').locator('p').textContent()
            const productPrice = await product.locator('div.productinfo.text-center').locator('h2').textContent()
            console.log(`${productName}, ${productPrice}`)

            // 进入详情页
            const viewLink = product.getByRole('link', {name: 'View Product'})
            await expect(viewLink).toBeVisible()
            await viewLink.click()
            await expect(page).toHaveTitle('Automation Exercise - Product Details')
            // await expect(page.locator('div.product-details')).toBeVisible()

            // 产品名相同
            const detailsName = await page.locator('div.product-information').locator('h2').textContent()
            expect(detailsName).toEqual(productName)


            // 产品价格相同
            const detailPrice = await page.locator('div.product-information').locator('span').locator('span').textContent()
            expect(detailPrice?.toLowerCase()).toEqual(productPrice?.toLowerCase())

            // 分类、库存、品牌存在
            expect(page.locator('.product-information').locator('p', {hasText: 'Category:' })).toBeVisible()
            expect(page.locator('.product-information').locator('p', {hasText: 'Availability:' })).toBeVisible()
            expect(page.locator('.product-information').locator('p', {hasText: 'Brand:' })).toBeVisible()
            await page.goBack()
            await expect(page.locator('.features_items')).toBeVisible();

        }
    });

    test('3.2 search product', async ({ page }) => {
        /* 在产品列表页使用搜索框搜索产品名 → 验证搜索结果是否正确显示相关产品 */
        const searchField = page.locator('#search_product')
        const submitButton = page.locator('#submit_search')

        enum Color {
            Red = "red",
            Blue = "blue",
            Black = "black"
        }

        // 遍历枚举
        for (const color of Object.values(Color)) {
            console.log(color)
            await searchField.fill(color)
            await submitButton.click()
            await expect(page.locator('.features_items')).toBeVisible()

            const products = page.locator('div.product-image-wrapper')
            const productCount = await products.count()
            console.log(`color = ${color}`)
            console.log(`count = ${productCount}`)
            if (productCount != 0) {
                for (let i=0; i<productCount; i++) {
                    const product = products.nth(i)
                    const productName = await product.locator('div.productinfo.text-center').locator('p').textContent()
                    console.log(`productName is ${productName}`)
                    expect(productName?.toLowerCase()).toContain(color.toLowerCase())
                }
            }
        }
    });

});