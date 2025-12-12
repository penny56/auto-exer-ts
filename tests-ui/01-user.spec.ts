import {test, expect } from '@playwright/test'
import fs from 'fs'

test.beforeEach(async ({ page }, testInfo) => {
    console.log('>>> Str to -------> ', testInfo.title)

    await page.goto("https://www.automationexercise.com/login", { waitUntil: "domcontentloaded" })
    await page.getByText('Login to your account').waitFor({ state: 'visible' })
});

test.afterEach(async ({ page }, testInfo) => {
    console.log('=== End of =======> ', testInfo.title)
});

test.describe('No session', () => {

    test.use({ storageState: undefined })

    test('1.1 Register and delete User', async ({ page }) => {

        /* 新用户注册流程 + 注册后删除账号 */
        // 1. 新用户注册
        const code = String(Math.floor(Math.random() * 999999) + 1)
        const username = `user${code}`
        const useremail = `user${code}@any`
        await page.locator('[data-qa="signup-name"]').fill(username)
        await page.locator('[data-qa="signup-email"]').fill(useremail)

        await page.locator('[data-qa="signup-button"]').click()

        // Fill details: Title, Name, Email, Password, Date of birth
        await page.locator('#password').fill(username)
        const daysDropDown = 'select#days'
        await page.selectOption(daysDropDown, { label: '2'})
        const monthsDropDown = 'select#months'
        await page.selectOption(monthsDropDown, { label: 'February'})
        const yearsDropDown = 'select#years'
        await page.selectOption(yearsDropDown, { label: '2020'})

        // Select checkbox 'Sign up for our newsletter!'
        await page.locator('#newsletter').check()

        // Select checkbox 'Receive special offers from our partners!'
        await page.locator('#optin').check()

        // Fill details: First name, Last name, Company, Address, Address2, Country, State, City, Zipcode, Mobile Number
        await page.locator('#first_name').fill('Emily')
        await page.locator('#last_name').fill('Al')
        await page.locator('#address1').fill('Haidian')

        const countryDropDown = 'select#country';
        await page.selectOption(countryDropDown, { label: 'Canada'})

        const state: string = 'Hebei'
        await page.locator('#state').fill(state)
        const city: string = 'Beijing'
        await page.locator('#city').fill(city)
        const zipCode: string = '100000'
        await page.locator('#zipcode').fill(zipCode)
        await page.locator('#mobile_number').fill('15611001100')

        // Click 'Create Account button'
        await page.getByRole('button', {name: 'Create Account'}).click()

        // Verify that 'ACCOUNT CREATED!' is visible
        await expect(page.getByRole('heading', {name: 'Account Created!'})).toBeVisible()

        // Click 'Continue' button
        await page.locator('[data-qa="continue-button"]').click()

        // 定位包含 "Logged in as <username>" 的元素
        // 验证：<li><a><i class="fa fa-user"></i> Logged in as <b>ss</b></a></li>
        const loggedInText = await page.locator('li:has-text("Logged in as")').textContent()
        expect(loggedInText).toContain('Logged in as')
        expect(loggedInText).toContain(username)

        // 2. 删除账号
        await page.getByRole('link', {name: 'Delete Account'}).click()
        await expect(page).toHaveURL(/.*delete_account.*/)
        await expect(page.getByRole('heading', {name: 'Account Deleted!'})).toBeVisible()
        await page.getByRole('link', {name: 'Continue'}).click()
        await expect(page).toHaveTitle('Automation Exercise')
    });

    test('1.2 Login User with correct email and password and log out', async ({ page }) => {
        /* 用正确邮箱/密码登录账号，然后登出账号 */

        // 读取登录用户
        const jsonStr = fs.readFileSync('user-info.json', 'utf8')
        const data = JSON.parse(jsonStr)

        await page.locator('[data-qa="login-email"]').fill(data.useremail)
        await page.locator('[data-qa="login-password"]').fill(data.password)
        await page.locator('[data-qa="login-button"]').click()

        // 定位包含 "Logged in as <username>" 的元素
        // 验证：<li><a><i class="fa fa-user"></i> Logged in as <b>ss</b></a></li>
        const loggedInText = await page.locator('li:has-text("Logged in as")').textContent()
        expect(loggedInText).toContain('Logged in as')
        expect(loggedInText).toContain(data.username)

        // 2. 登出用户
        await page.getByRole('link', {name: 'Logout'}).click()
        await expect(page).toHaveURL(/.*login.*/)
        await expect(page.getByRole('heading', {name: 'Login to your account'})).toBeVisible()

    });

    test('1.3 Login User with incorrect email and password', async ({ page }) => {
        /* 用错误的邮箱/密码登录账号 */

        // 读取登录用户
        const jsonStr = fs.readFileSync('user-info.json', 'utf8')
        const data = JSON.parse(jsonStr)

        // 使用正确的username + 错误的密码
        await page.locator('[data-qa="login-email"]').fill(data.useremail)
        await page.locator('[data-qa="login-password"]').fill('wrong')
        await page.locator('[data-qa="login-button"]').click()

        const wrongPassword = page.getByText('Your email or password is incorrect!')
        await expect(wrongPassword).toBeVisible()
        await expect(wrongPassword).toHaveText('Your email or password is incorrect!')

    });

    test('1.4 Register User with existing email', async ({ page }) => {
        /* 用已有的邮箱注册账号 */

        // 读取登录用户
        const jsonStr = fs.readFileSync('user-info.json', 'utf8')
        const data = JSON.parse(jsonStr)

        // 使用随机的username + 已存在的email
        await page.locator('[data-qa="signup-name"]').fill('anyone')
        await page.locator('[data-qa="signup-email"]').fill(data.useremail)

        await page.locator('[data-qa="signup-button"]').click()

        const wrongPassword = page.getByText('Email Address already exist!')
        await expect(wrongPassword).toBeVisible()
        await expect(wrongPassword).toHaveText('Email Address already exist!')        
    });

});