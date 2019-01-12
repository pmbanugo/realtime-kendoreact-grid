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
import Hamoni from "hamoni-sync";
const primitiveName = "kendo-grid";

class App extends Component {
  state = {
    products: [],
    productInEdit: undefined,
    skip: 0,
    take: 10
  };

  async componentDidMount() {
    const accountId = "YOUR_ACCOUNT_ID";
    const appId = "YOUR_APP_ID";

    try {
      //Note: this portion is recommended to be in your own server and you call it to get a token. This is to avoid exposing you app credentials
      const response = await fetch("https://api.sync.hamoni.tech/v1/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify({ accountId, appId })
      });
      const token = await response.json();
      this.hamoni = new Hamoni(token);

      await this.hamoni.connect();
      console.log("Yay!");
      const listPrimitive = await this.hamoni.get(primitiveName);
      this.listPrimitive = listPrimitive;
      this.setState({ products: this.listPrimitive.getAll() });
      this.subscribe();
    } catch (error) {
      if (error === "Error getting state from server") {
        console.log("state needs to be created on Hamoni");
      } else console.log(error);
    }
  }

  edit = dataItem => {
    this.setState({ productInEdit: this.cloneProduct(dataItem) });
  };

  remove = dataItem => {
    const products = this.state.products.slice();
    const index = products.findIndex(p => p.ProductID === dataItem.ProductID);
    if (index !== -1) {
      this.listPrimitive.remove(index);
    }
  };

  save = () => {
    const dataItem = this.state.productInEdit;
    const products = this.state.products.slice();

    if (dataItem.ProductID === undefined) {
      const newProduct = this.newProduct(dataItem);
      if (this.listPrimitive) this.listPrimitive.add(newProduct);
      else this.createListPrimitive(newProduct);
    } else {
      const index = this.state.products.findIndex(
        p => p.ProductID === dataItem.ProductID
      );
      this.listPrimitive.update(index, dataItem);
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

  subscribe() {
    this.listPrimitive.onItemUpdated(item => {
      const updatedProducts = [
        ...this.state.products.slice(0, item.index),
        item.value,
        ...this.state.products.slice(item.index + 1)
      ];
      this.setState({ products: updatedProducts });
    });

    this.listPrimitive.onItemAdded(item => {
      this.setState({ products: [...this.state.products, item.value] });
    });

    this.listPrimitive.onItemRemoved(item => {
      this.setState({
        products: this.state.products.filter(
          x => x.ProductID !== item.value.ProductID
        )
      });
    });

    this.listPrimitive.onSync(data => {
      this.setState({ products: data });
    });
  }

  createListPrimitive(data) {
    this.hamoni
      .createList(primitiveName, [data])
      .then(listPrimitive => {
        this.listPrimitive = listPrimitive;
        this.setState({ products: this.listPrimitive.getAll() });
        this.subscribe();
      })
      .catch(console.log);
  }

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
