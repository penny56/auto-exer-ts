import { chromium } from '@playwright/test'
import type { FullConfig } from '@playwright/test'
import fs from 'fs'

async function globalSetup(_config: FullConfig) {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const context = page.context()

    // 读取登录用户
    const jsonStr = fs.readFileSync('user-info.json', 'utf8')
    const data = JSON.parse(jsonStr)
    
    await page.goto("https://www.automationexercise.com/login")
    await page.locator('[data-qa="login-email"]').fill(data.useremail)
    await page.locator('[data-qa="login-password"]').fill(data.password)
    await page.locator('[data-qa="login-button"]').click()
    await context.storageState({path: './state.json'})
    await browser.close()
}

export default globalSetup
