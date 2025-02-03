const express = require("express")
const app = express()
const cors = require("cors")
const bodyParser = require("body-parser")

const userController = require("./controllers/UserController")
const productTypeController = require("./controllers/ProductTypeController")
const materialController = require("./controllers/MaterialController")
const stockMaterialController = require("./controllers/StockMaterialController")
const packagingController = require("./controllers/PackagingController")
const productController = require("./controllers/ProductController")
const productFormularController = require("./controllers/ProductFormularController")
const productionPlanController = require("./controllers/ProductionPlanController")
const productionController = require("./controllers/ProductionController")
const reportController = require("./controllers/ReportController")

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

//user
app.get("/api/user/list", userController.list)
app.post("/api/user/create", userController.create)
app.put("/api/user/updateUser/:id", userController.updateUser)
app.delete("/api/user/remove/:id", userController.remove)

app.get("/api/user/info", userController.info)
app.post("/api/user/signIn", userController.signIn)
app.put("/api/user/update", userController.update)

//product type
app.get("/api/productType/list", productTypeController.list)
app.post("/api/productType/create", productTypeController.create)
app.put("/api/productType/update/:id", productTypeController.update)
app.delete("/api/productType/remove/:id", productTypeController.remove)

//material
app.get("/api/material/list", materialController.list)
app.post("/api/material/create", materialController.create)
app.put("/api/material/update/:id", materialController.update)
app.delete("/api/material/remove/:id", materialController.remove)

//stock material
app.get("/api/stockMaterial/list", stockMaterialController.list)
app.post("/api/stockMaterial/create", stockMaterialController.create)
app.delete("/api/stockMaterial/remove/:id", stockMaterialController.remove)

//packaging
app.get("/api/packaging/list", packagingController.list)
app.post("/api/packaging/create", packagingController.create)
app.put("/api/packaging/update/:id", packagingController.update)
app.delete("/api/packaging/remove/:id", packagingController.remove)

//product
app.get("/api/product/list", productController.list)
app.post("/api/product/create", productController.create)
app.put("/api/product/update/:id", productController.update)
app.delete("/api/product/remove/:id", productController.remove)

//product formular
app.get("/api/productFormular/list/:productId", productFormularController.list)
app.post("/api/productFormular/create", productFormularController.create)
app.put("/api/productFormular/update/:id", productFormularController.update)
app.delete("/api/productFormular/remove/:formularId", productFormularController.remove)

//production plan
app.get("/api/productionPlan/list", productionPlanController.list)
app.post("/api/productionPlan/create", productionPlanController.create)
app.put("/api/productionPlan/update/:id", productionPlanController.update)
app.delete("/api/productionPlan/remove/:id", productionPlanController.remove)

//production
app.get("/api/production/list/:productionPlanId", productionController.list)
app.post("/api/production/create", productionController.create)
app.put("/api/production/update/:id", productionController.update)
app.delete("/api/production/remove/:id", productionController.remove)

//report
app.post("/api/report/production", reportController.production)
app.get("/api/report/productsAndCost", reportController.productsAndCost)
app.post("/api/report/sumProductionPlanPerYearAndMonth", reportController.sumProductionPlanPerYearAndMonth)
app.post("/api/report/sumProductionPerYearAndMonth", reportController.sumProductionPerYearAndMonth)
app.post("/api/report/sumPriceStockMaterialPerYearAndMonth", reportController.sumPriceStockMaterialPerYearAndMonth)
app.post("/api/report/sumProductionPerDayInmonthAndYear", reportController.sumProductionPerDayInmonthAndYear)
app.post("/api/report/sumProductionPerMonthAndYear", reportController.sumProductionPerMonthAndYear)


app.listen(3001, () => {
    console.log("Server is running on port 3001")
})