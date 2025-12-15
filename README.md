https://www.automationexercise.com/api_list 里虽然有一些 restful api，但是形为不符合restful api的规范，如使用 post method 来 search products，把filter放在 request body中。

Just focus on the Playwright+TS for the UI tests.

## 一、用户／账户相关（User / Account）

* Test Case 1: Register User  
  新用户注册流程 + 创建账号 + 注册后删除账号  
  automationexercise.com

* Test Case 2: Login User with correct email and password  
  使用正确邮箱和密码登录账号，然后删除账号  
  automationexercise.com

* Test Case 3: Login User with incorrect email and password  
  使用错误邮箱和密码登录，验证登录失败提示  
  automationexercise.com

* Test Case 4: Logout User  
  登录后执行登出流程，验证已成功退出  
  automationexercise.com

* Test Case 5: Register User with existing email  
  使用已注册邮箱进行注册，验证重复注册的错误提示  
  automationexercise.com


## 二、联系我们／页面导航／基础页面功能

* Test Case 6: Contact Us Form  
  填写并提交 Contact Us 表单 + 上传文件 + 验证提交成功提示 + 返回首页  
  automationexercise.com

* Test Case 7: Verify Test Cases Page  
  点击 “Test Cases” 链接/按钮，验证成功跳转并显示 Test Cases 页面  
  automationexercise.com


## 三、产品 / 商品浏览 & 搜索（Product / Catalog）

* Test Case 8: Verify All Products and Product Detail Page  
  进入 Products 页面 → 查看所有产品 → 进入产品详情页 →  
  验证名称 / 分类 / 价格 / 库存 / 品牌 / 状态等信息  
  automationexercise.com

* Test Case 9: Search Product  
  在 Products 页面使用搜索框搜索产品 → 验证搜索结果正确显示  
  automationexercise.com


## 四、购物车 / 购物流程（Cart / Checkout / Order）

* Test Case 12: Add Products in Cart  
  添加多个产品到购物车 → 查看购物车 → 验证商品、数量、价格和总价  
  automationexercise.com

* Test Case 13: Verify Product Quantity in Cart  
  在产品详情页设置数量为 4 → 加入购物车 →  
  验证购物车中数量显示为 4  
  automationexercise.com

* Test Case 14: Place Order: Register while Checkout  
  未登录状态下结账 → 注册账号 → 填写信息 → 付款下单 →  
  验证下单成功 → 删除账号  
  automationexercise.com

* Test Case 15: Place Order: Register before Checkout  
  注册并登录账号 → 添加商品 → 结账 → 付款下单 →  
  验证下单成功 → 删除账号  
  automationexercise.com

* Test Case 16: Place Order: Login before Checkout  
  已有账号登录 → 添加商品 → 结账 → 付款 →  
  验证下单成功 → 删除账号  
  automationexercise.com

* Test Case 17: Remove Products From Cart  
  向购物车添加产品 → 删除其中一个产品 →  
  验证该产品已从购物车移除  
  automationexercise.com

* Test Case 23: Verify Address Details in Checkout Page  
  注册时填写账单/收货地址 → 结账页面验证地址信息一致 →  
  删除账号  
  automationexercise.com

* Test Case 24: Download Invoice after Purchase Order  
  下单成功后点击 “Download Invoice” → 验证发票成功下载 →  
  删除账号  
  automationexercise.com


## 五、评论 / 推荐 / 附加功能（Extras）

* Test Case 21: Add Review on Product  
  进入产品详情页 → 填写姓名、邮箱、评论内容 → 提交 →  
  验证 “Thank you for your review.” 提示  
  automationexercise.com

* Test Case 22: Add to Cart from Recommended Items  
  滚动到页面底部 → 在 “RECOMMENDED ITEMS” 中添加商品 →  
  查看购物车并验证商品已加入  
  automationexercise.com

* Test Case 10: Verify Subscription in Home Page  
  首页底部输入邮箱进行订阅 → 提交 → 验证订阅成功提示  
  automationexercise.com

* Test Case 11: Verify Subscription in Cart Page  
  购物车页面底部输入邮箱进行订阅 → 提交 → 验证订阅成功提示  
  automationexercise.com

* Test Case 25: Verify Scroll Up using 'Arrow' Button and Scroll Down  
  首页滚动到底部 → 点击右下角箭头 →  
  验证页面滚动回顶部且顶部内容可见  
  automationexercise.com

* Test Case 26: Verify Scroll Up without 'Arrow' Button and Scroll Down  
  滚动到底部 → 手动滚动回顶部 →  
  验证顶部内容显示正确  
  automationexercise.com
