import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import "@progress/kendo-theme-material/dist/all.css";
import {
  Grid,
  GridColumn as Column,
  GridToolbar
} from "@progress/kendo-react-grid";
import DialogContainer from "./DialogContainer.js";
import CellWithEditing from "./CellWithEditing.js";

class App extends Component {
  state = {
    products: [
      {
        ProductID: 1,
        ProductName: "Chai",
        SupplierID: 1,
        CategoryID: 1,
        QuantityPerUnit: "10 boxes x 20 bags",
        UnitPrice: 18,
        UnitsInStock: 39,
        UnitsOnOrder: 0,
        ReorderLevel: 10,
        Discontinued: false,
        Category: {
          CategoryID: 1,
          CategoryName: "Beverages",
          Description: "Soft drinks, coffees, teas, beers, and ales"
        },
        FirstOrderedOn: new Date(1996, 8, 20)
      },
      {
        ProductID: 2,
        ProductName: "Chang",
        SupplierID: 1,
        CategoryID: 1,
        QuantityPerUnit: "24 - 12 oz bottles",
        UnitPrice: 19,
        UnitsInStock: 17,
        UnitsOnOrder: 40,
        ReorderLevel: 25,
        Discontinued: false,
        Category: {
          CategoryID: 1,
          CategoryName: "Beverages",
          Description: "Soft drinks, coffees, teas, beers, and ales"
        },
        FirstOrderedOn: new Date(1996, 7, 12)
      },
      {
        ProductID: 3,
        ProductName: "Aniseed Syrup",
        SupplierID: 1,
        CategoryID: 2,
        QuantityPerUnit: "12 - 550 ml bottles",
        UnitPrice: 10,
        UnitsInStock: 13,
        UnitsOnOrder: 70,
        ReorderLevel: 25,
        Discontinued: false,
        Category: {
          CategoryID: 2,
          CategoryName: "Condiments",
          Description:
            "Sweet and savory sauces, relishes, spreads, and seasonings"
        },
        FirstOrderedOn: new Date(1996, 8, 26)
      },
      {
        ProductID: 4,
        ProductName: "Chef Anton's Cajun Seasoning",
        SupplierID: 2,
        CategoryID: 2,
        QuantityPerUnit: "48 - 6 oz jars",
        UnitPrice: 22,
        UnitsInStock: 53,
        UnitsOnOrder: 0,
        ReorderLevel: 0,
        Discontinued: false,
        Category: {
          CategoryID: 2,
          CategoryName: "Condiments",
          Description:
            "Sweet and savory sauces, relishes, spreads, and seasonings"
        },
        FirstOrderedOn: new Date(1996, 9, 19)
      }
    ],
    productInEdit: undefined,
    skip: 0,
    take: 2
  };

  edit = dataItem => {
    this.setState({ productInEdit: this.cloneProduct(dataItem) });
  };

  remove = dataItem => {
    const products = this.state.products.slice();
    const index = products.findIndex(p => p.ProductID === dataItem.ProductID);
    if (index !== -1) {
      products.splice(index, 1);
      this.setState({
        products: products
      });
    }
  };

  save = () => {
    const dataItem = this.state.productInEdit;
    const products = this.state.products.slice();

    if (dataItem.ProductID === undefined) {
      //TODO: add to list primitive
      products.unshift(this.newProduct(dataItem));
    } else {
      //TODO: update list primitve
      const index = products.findIndex(p => p.ProductID === dataItem.ProductID);
      products.splice(index, 1, dataItem);
    }

    this.setState({
      products: products,
      productInEdit: undefined
    });
  };

  cancel = () => {
    this.setState({ productInEdit: undefined });
  };

  insert = () => {
    console.log("inserting");
    this.setState({ productInEdit: {} });
  };

  dialogTitle() {
    return `${
      this.state.productInEdit.ProductID === undefined ? "Add" : "Edit"
    } product`;
  }
  cloneProduct(product) {
    return Object.assign({}, product);
  }

  newProduct(source) {
    const newProduct = {
      ProductID: this.generateId(),
      ProductName: "",
      UnitsInStock: 0,
      Discontinued: false
    };

    return Object.assign(newProduct, source);
  }

  generateId() {
    let id = 1;
    this.state.products.forEach(p => {
      id = Math.max((p.ProductID || 0) + 1, id);
    });
    return id;
  }

  pageChange = event => {
    this.setState({
      skip: event.page.skip,
      take: event.page.take
    });
  };
  render() {
    return (
      <div>
        <Grid
          style={{ height: "420px" }}
          data={this.state.products.slice(
            this.state.skip,
            this.state.take + this.state.skip
          )}
          pageable={true}
          skip={this.state.skip}
          take={this.state.take}
          total={this.state.products.length}
          onPageChange={this.pageChange}
        >
          <GridToolbar>
            <button onClick={this.insert} className="k-button">
              Add New
            </button>
          </GridToolbar>
          <Column field="ProductID" title="Id" width="50px" />
          <Column field="ProductName" title="Product Name" />
          <Column field="UnitsInStock" title="Units In Stock" />
          <Column field="Discontinued" />
          <Column title="Edit" cell={CellWithEditing(this.edit, this.remove)} />
        </Grid>

        {this.state.productInEdit && (
          <DialogContainer
            dataItem={this.state.productInEdit}
            save={this.save}
            cancel={this.cancel}
          />
        )}
      </div>
    );
  }
}

export default App;
