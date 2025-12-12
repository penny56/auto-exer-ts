import {test, expect } from '@playwright/test'
import fs from 'fs'

test.beforeEach(async ({ page }, testInfo) => {
    console.log('>>> Str to -------> ', testInfo.title)

    await page.goto("https://www.automationexercise.com/products", { waitUntil: "domcontentloaded" })
    // 至少加载一个商品
    await page.waitForSelector('.product-image-wrapper', { state: 'visible' })
});

test.afterEach(async ({ page }, testInfo) => {
    console.log('=== End of =======> ', testInfo.title)
});

test.describe('No session', () => {

    test.use({ storageState: undefined })

    test('4.1 add products in cart', async ({ page }) => {
        /* 1. 向购物车添加多个产品: 第一个商品1个，第二个商品2个 
        → 查看购物车 → 验证多个产品及价格/数量/总价显示正确 */
        
        // 定义 Product 对象数组
        type Product = {
            name: string
            quantity: number
            price: number
        }

        const cartArr: Product[] = []

        const wrappers = page.locator('div.product-image-wrapper')
        const overlays = page.locator('div.product-overlay')

        // 1. 第1个商品加1个
        let wrapper = wrappers.nth(0)
        let overlay = overlays.nth(0)

        // 光标移动上去才出现
        await wrapper.hover()
        await expect(overlay).toBeVisible()

        // 1.1 得到 name 与 price, 并更新 cart
        let nameString = await overlay.locator('p').textContent() ?? ''
        let priceString = await overlay.locator('h2').textContent()
        let priceNum = Number(priceString?.split(" ").pop())
        let isExist = cartArr.find(p => p.name === nameString)
        
        if (isExist) {
            isExist.quantity += 1
        } else {
            cartArr.push({ name: nameString, quantity: 1, price: priceNum})
        }

        // 1.2 点击加cart
        let addButton = wrapper.locator('a.add-to-cart').first()
        await expect(addButton).toBeVisible()
        await addButton.click()
        await expect(page.getByText('Your product has been added to cart.')).toBeVisible()
        await page.getByRole('button', {name: 'Continue Shopping'}).click()

        // 2. 第2个商品加1个
        wrapper = wrappers.nth(1)
        overlay = overlays.nth(1)

        // 光标移动上去才出现
        await wrapper.hover()
        await expect(overlay).toBeVisible()

        // 2.1 得到 name 与 price, 并更新 cart
        nameString = await overlay.locator('p').textContent() ?? ''
        priceString = await overlay.locator('h2').textContent()
        priceNum = Number(priceString?.split(" ").pop())
        isExist = cartArr.find(p => p.name === nameString)
        
        if (isExist) {
            isExist.quantity += 1
        } else {
            cartArr.push({ name: nameString, quantity: 1, price: priceNum})
        }

        // 2.2 点击加cart
        addButton = wrapper.locator('a.add-to-cart').first()
        await expect(addButton).toBeVisible()
        await addButton.click()
        await expect(page.getByText('Your product has been added to cart.')).toBeVisible()
        await page.getByRole('button', {name: 'Continue Shopping'}).click()

        // 3. 第2个商品再加1个
        wrapper = wrappers.nth(1)
        overlay = overlays.nth(1)

        // 光标移动上去才出现
        await wrapper.hover()
        await expect(overlay).toBeVisible()

        // 3.1 得到 name 与 price, 并更新 cart
        nameString = await overlay.locator('p').textContent() ?? ''
        priceString = await overlay.locator('h2').textContent()
        priceNum = Number(priceString?.split(" ").pop())
        isExist = cartArr.find(p => p.name === nameString)
        
        if (isExist) {
            isExist.quantity += 1
        } else {
            cartArr.push({ name: nameString, quantity: 1, price: priceNum})
        }

        // 3.2 点击加cart，并进入cart
        addButton = wrapper.locator('a.add-to-cart').first()
        await expect(addButton).toBeVisible()
        await addButton.click()
        await expect(page.getByText('Your product has been added to cart.')).toBeVisible()
        await page.getByRole('link', {name: 'View Cart'}).click()
        console.log(cartArr)

        await expect(page.locator('#cart_info_table')).toBeVisible()

        // 4. 进入 cart 页面，验证cartTable 内容与 cartArr 相符

        // table → tbody → tr 而且不带table header，只有table内容
        const rows = page.locator('#cart_info_table tbody tr')
        const rowCount = await rows.count()

        for (let i=0; i<rowCount; i++) {

            // 得到table中当前row的内容
            const row = rows.nth(i)
            const nameRow = await row.locator('td.cart_description h4 a').textContent() ?? ''
            const quantityRowString = await row.locator('td.cart_quantity button').textContent() ?? ''
            const quantityRowNumber = Number(quantityRowString)
            const priceRowString = await row.locator('td.cart_price p').textContent() ?? ''
            const priceRowNumber = Number(priceRowString.split(" ").pop())

            console.log(`name: ${nameRow}, quantity: ${quantityRowNumber}, price: ${priceRowNumber}`)

            if (!nameRow) {
                throw new Error(`Row ${i} has no product name`)
            }
            
            // 在 cartArr 中查找
            const productIndex = cartArr.findIndex(p => p.name === nameRow)
            if (productIndex === -1) {
                throw new Error(`Product ${nameRow} not found in cartArr`)
            }

            // 减少数量
            cartArr[productIndex]!.quantity -= quantityRowNumber

            // 如果减小到0，移除，实际只可能==0，不应该<0
            if (cartArr[productIndex]!.quantity <= 0) {
                cartArr.splice(productIndex, 1)
            }
        }

        // 遍历完成后，cartArr 应该为空
        if (cartArr.length !== 0) {
            throw new Error(`cartArr not empty after verification: ${JSON.stringify(cartArr)}`);
        }

    });

    test('4.2 verify product quantity in cart', async ({ page }) => {
        /* 在产品详情页将数量设为 4 → 加入购物车 → 查看购物车 → 验证数量正确显示为 4 */
        await page.getByRole('link', {name: 'View Product'}).first().click()
        await expect(page.locator('div.product-details')).toBeVisible()
        const productName = await page.locator('div.product-information h2').textContent() ?? ''

        // update the quantity to 4 and click
        await page.locator('#quantity').fill('4')
        await page.getByRole('button', {name: 'Add to cart'}).click()
        await expect(page.getByText('Your product has been added to cart.')).toBeVisible()
        await page.getByRole('link', {name: 'View Cart'}).click()
        await expect(page.locator('#cart_info_table')).toBeVisible()

        // 验证cart，应该只有一行
        const row = page.locator('#cart_info_table tbody tr')

        const rowName = await row.locator('td.cart_description h4 a').textContent() ?? ''
        expect(rowName).toEqual(productName)

        const rowQualtity = await row.locator('td.cart_quantity button').textContent() ?? ''
        expect(rowQualtity).toEqual('4')
    });

    test('4.3 place order: register while checkout', async ({ page }) => {
        /* 未登录 → 结账流程 → 注册/登录 → 填写信息 → 付款下单 → 下单成功 → 删除账号测试流程 */
        // 1. 结账流程
        await page.getByRole('link', {name: 'View Product'}).first().click()
        await expect(page.locator('div.product-details')).toBeVisible()
        await page.getByRole('button', {name: 'Add to cart'}).click()
        await expect(page.getByText('Your product has been added to cart.')).toBeVisible()
        await page.getByRole('link', {name: 'View Cart'}).click()
        await expect(page.locator('#cart_info_table')).toBeVisible()

        // 点击 process to checkout
        await page.getByText('Proceed To Checkout').click()
        await page.locator('#checkoutModal').getByRole('link', {name: 'Register / Login'}).click()

        // 2. 注册
        const code = String(Math.floor(Math.random() * 999999) + 1)
        const username = `user${code}`
        const useremail = `user${code}@any`
        await page.locator('[data-qa="signup-name"]').fill(username)
        await page.locator('[data-qa="signup-email"]').fill(useremail)

        await page.locator('[data-qa="signup-button"]').click()

        // 填写信息 Fill details: Title, Name, Email, Password, Date of birth
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

        // 4. 付款下单
        await page.locator('div.shop-menu').getByText('Cart').click()
        await page.getByText('Proceed To Checkout').click()
        await page.getByRole('link', {name: 'Place Order'}).click()
        await page.waitForSelector('#cart_items', { state: 'visible' })

        await page.locator('[data-qa="name-on-card"]').fill('Matt')
        await page.locator('[data-qa="card-number"]').fill('123456789')
        await page.locator('[data-qa="cvc"]').fill('12')
        await page.locator('[data-qa="expiry-month"]').fill('01')
        await page.locator('[data-qa="expiry-year"]').fill('02')

        await page.locator('#submit').click()

        await expect(page.getByText('Order Placed!')).toBeVisible()
        await page.getByRole('link', {name: 'Continue'}).click()

        // 5. 删除账号
        await page.getByRole('link', {name: 'Delete Account'}).waitFor( { state: 'visible' } )
        await page.getByRole('link', {name: 'Delete Account'}).click()
        await expect(page).toHaveURL(/.*delete_account.*/)
        await expect(page.getByRole('heading', {name: 'Account Deleted!'})).toBeVisible()
        await page.getByRole('link', {name: 'Continue'}).click()
        await expect(page).toHaveTitle('Automation Exercise')
    });

    test('4.4 place order: register before checkout', async ({ page }) => {
        /* 1. 注册账号 → 登录 → 2. 加入购物车 → 结账 → 填写信息 → 付款下单 → 下单成功 → 删除账号 */
        // 1. 注册账号, 登录
        const code = String(Math.floor(Math.random() * 999999) + 1)
        const username = `user${code}`
        const useremail = `user${code}@any`
        await page.locator('div.shop-menu').getByText('Signup / Login').click()
        await page.locator('[data-qa="signup-name"]').fill(username)
        await page.locator('[data-qa="signup-email"]').fill(useremail)

        await page.locator('[data-qa="signup-button"]').click()

        // 填写信息 Fill details: Title, Name, Email, Password, Date of birth
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

        // 2. 加入购物车
        await page.getByRole('link', {name: 'View Product'}).first().click()
        await expect(page.locator('div.product-details')).toBeVisible()
        await page.getByRole('button', {name: 'Add to cart'}).click()
        await expect(page.getByText('Your product has been added to cart.')).toBeVisible()
        await page.getByRole('link', {name: 'View Cart'}).click()
        await expect(page.locator('#cart_info_table')).toBeVisible()

        // 点击 process to checkout
        await page.getByText('Proceed To Checkout').click()
        
        // 在 view your order页面，点击 Place Order
        await page.getByRole('link', {name: 'Place Order'}).click()

        // 在 Payment 页面输入支付信息
        await page.locator('[data-qa="name-on-card"]').fill('Matt')
        await page.locator('[data-qa="card-number"]').fill('123456789')
        await page.locator('[data-qa="cvc"]').fill('12')
        await page.locator('[data-qa="expiry-month"]').fill('01')
        await page.locator('[data-qa="expiry-year"]').fill('02')

        await page.locator('#submit').click()

        await expect(page.getByText('Order Placed!')).toBeVisible()
        await page.getByRole('link', {name: 'Continue'}).click()

        // 5. 删除账号
        await page.getByRole('link', {name: 'Delete Account'}).waitFor( { state: 'visible' } )
        await page.getByRole('link', {name: 'Delete Account'}).click()
        await expect(page).toHaveURL(/.*delete_account.*/)
        await expect(page.getByRole('heading', {name: 'Account Deleted!'})).toBeVisible()
        await page.getByRole('link', {name: 'Continue'}).click()
        await expect(page).toHaveTitle('Automation Exercise')
    }); 

    test('4.5 remove products from cart', async ({ page }) => {
        /* 1. 向购物车添加3个产品 → 2. 然后删除购物车中某个产品 → 3. 验证购物车中该产品已移除 */
        const wrappers = page.locator('div.product-image-wrapper')
        for (let i=0; i<3; i++) {
            const wrapper = wrappers.nth(i)
            const addButton = wrapper.locator('a.add-to-cart').first()
            await expect(addButton).toBeVisible()
            await addButton.click()
            await expect(page.getByText('Your product has been added to cart.')).toBeVisible()
            await page.getByRole('button', {name: 'Continue Shopping'}).click()
        }

        // 2. 然后删除购物车中某个产品
        await page.locator('div.shop-menu').getByText('Cart').click()
        await expect(page.locator('#cart_info_table')).toBeVisible()

        let rows = page.locator('#cart_info_table').locator('tr')
        await expect(rows).toHaveCount(4)

        // do 删除
        await rows.locator('a.cart_quantity_delete').first().click()

        // 删除一个之后，只有2行
        rows = page.locator('#cart_info_table').locator('tr')
        await expect(rows).toHaveCount(3)
    });
});

test.describe('With session', () => {

    test.use({ storageState: './state.json'})

    test('4.6 place order: login before checkout', async ({ page }) => {
        /* 已有账号 → 登录 → 1. 加入购物车 → 2. 结账 → 3. 付款 → 4. 下单成功 */
        // 1. 加商品到购物车
        const wrapper = page.locator('div.product-image-wrapper').first()
        const addButton = wrapper.locator('a.add-to-cart').first()
        await expect(addButton).toBeVisible()
        await addButton.click()
        await expect(page.getByText('Your product has been added to cart.')).toBeVisible()
        await page.getByRole('button', {name: 'Continue Shopping'}).click()

        // 2. 结账
        await page.locator('div.shop-menu').getByText('Cart').click()
        await expect(page.locator('#cart_info_table')).toBeVisible()        

        // 点击 process to checkout
        await page.getByText('Proceed To Checkout').click()
        
        // 在 view your order页面，点击 Place Order
        await page.getByRole('link', {name: 'Place Order'}).click()

        // 3. 付款
        // 在 Payment 页面输入支付信息
        await page.locator('[data-qa="name-on-card"]').fill('Matt')
        await page.locator('[data-qa="card-number"]').fill('123456789')
        await page.locator('[data-qa="cvc"]').fill('12')
        await page.locator('[data-qa="expiry-month"]').fill('01')
        await page.locator('[data-qa="expiry-year"]').fill('02')

        await page.locator('#submit').click()

        // 4. 下单成功
        await expect(page.getByText('Order Placed!')).toBeVisible()
        await page.getByRole('link', {name: 'Continue'}).click()
    });

    test('4.7 verify address details in checkout page', async ({ page }) => {
        /* 在注册信息中填写收货／账单地址 → 1. 在 checkout 页面验证地址是否与注册信息一致 */
        // 加商品到购物车
        const wrapper = page.locator('div.product-image-wrapper').first()
        const addButton = wrapper.locator('a.add-to-cart').first()
        await expect(addButton).toBeVisible()
        await addButton.click()
        await expect(page.getByText('Your product has been added to cart.')).toBeVisible()
        await page.getByRole('button', {name: 'Continue Shopping'}).click()

        // 结账
        await page.locator('div.shop-menu').getByText('Cart').click()
        await expect(page.locator('#cart_info_table')).toBeVisible()  

        // 点击 process to checkout
        await page.getByText('Proceed To Checkout').click()

        // 1. 验证信息一致
        await page.getByText('Your delivery address').waitFor({ state: 'visible' })
        let address = await page.locator('#address_delivery').locator('li.address_city.address_state_name.address_postcode').textContent() ?? ''
        address = address.trim().replace(/\s+/g, ' ')

        console.log(address)
        // 读取登录用户
        const jsonStr = fs.readFileSync('user-info.json', 'utf8')
        const data = JSON.parse(jsonStr)

        const addressJson = data.city + ' ' + data.state + ' ' + data.postcode
        expect(address).toEqual(addressJson)
    });

    test('4.8 download invoice after purchase order', async ({ page }) => {
        /* 下单成功后 → 点击 “Download Invoice” → 验证发票成功下载 */

    });
});