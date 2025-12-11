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
        await page.goto("https://www.automationexercise.com/")
        // 至少加载一个商品
        await page.waitForSelector('.product-image-wrapper', { state: 'visible' })
    });

    test('2.1 contact us form', async ({ page }) => {

        /* 测试 “Contact Us” 表单提交 + 上传文件 + 提交 + 提交成功反馈 + 返回首页流程 */
        await page.getByRole('link', {name: 'Contact Us'}).click()

        await expect(page).toHaveURL(/.*contact_us.*/)
        await expect(page.getByRole('heading', {name: 'Contact Us'})).toBeVisible()

        await page.locator('[data-qa="name"]').fill('Matt')
        await page.locator('[data-qa="email"]').fill('matt@any')
        await page.locator('[data-qa="subject"]').fill('this is the title')
        await page.locator('#message').fill('this is the content.')
        await page.locator('[data-qa="name"]').click()
        await page.locator('[data-qa="name"]').click()

        // await page.pause()

        const fileInput = page.locator('input[name="upload_file"]')
        await fileInput.setInputFiles('./user-info.json')

        // 在click之前设置监听
        page.once('dialog', async dialog => {
            expect(dialog.message()).toContain('Press OK to proceed')
            console.log('Dialog text:', dialog.message())
            // 因为 Playwright 对系统 dialog 的“点击 OK”并不是鼠标动作，而是直接调用浏览器内部 API，所以看不到点击动作！
            await dialog.accept();
        })

        await page.getByRole('button', {name: 'Submit'}).click()
    
        await expect(page.getByRole('heading', {name: 'Get In Touch'})).toBeVisible()
        await page.getByRole('link', {name: 'Home'}).click()
        await expect(page).toHaveTitle('Automation Exercise')
    });

    test('2.2 verify test cases page', async ({ page }) => {

        /* 测试点击 “Test Cases” 链接/按钮后能正确跳转并显示 Test Cases 页面 */
        await page.locator('ul.navbar-nav').getByRole('link', {name: 'Test Cases'}).click()
        await expect(page).toHaveURL(/.*test_cases.*/)
        await expect(page).toHaveTitle('Automation Practice Website for UI Testing - Test Cases')
    });
});