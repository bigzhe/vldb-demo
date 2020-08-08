const _ = require("lodash")

const relationSchema = {
  datasets: [
    {
      name : "Retailer",
      relations : ["Inventory", "Location", "Item", "Census", "Weather"]
    },
    {
      name : "Favorita",
      relations : ["Sales", "Stores", "Items", "Transactions", "Oil", "Holiday"]
    },
    {
      name : "Example",
      relations : ["R", "S", "T", "U"]
    }
  ],
  relations : [
    {
      name : "Inventory",
      attributes : ["locn","dateid","ksn","inventoryunits"],
      size : 1000 
    },
    {
      name : "Location",
      attributes : ["locn","zip","rgn_cd","clim_zn_nbr","tot_area_sq_ft","sell_area_sq_ft","avghhi","supertargetdistance","supertargetdrivetime","targetdistance","targetdrivetime","walmartdistance","walmartdrivetime","walmartsupercenterdistance","walmartsupercenterdrivetime"],
      size : 1000 
    },
    {
      name : "Census",
      attributes : ["zip","population","white","asian","pacific","black","medianage","occupiedhouseunits","houseunits","families","households","husbwife","males","females","householdschildren","hispanic"],
      size : 1000 
    },
    {
      name : "Item",
      attributes : ["ksn","subcategory","category","categoryCluster","prize"],
      size : 1000 
    },    {
      name : "Weather",
      attributes : ["locn","dateid","rain","snow","maxtemp","mintemp","meanwind","thunder"],
      size : 1000 
    },
    {
      name : "Store",
      attributes : ["a", "b", "c"],
      size : 1000 
    },
    {
      name : "Sales",
      attributes : ["date","store","item","unit_sales","onpromotion"],
      size : 1000 
    },
    {
      name : "Stores",
      attributes : ["store","city","state","store_type","cluster"],
      size : 1000 
    },
    {
      name : "Items",
      attributes : ["item","family","itemclass","perishable"],
      size : 1000 
    },
    {
      name : "Transactions",
      attributes : ["date","store","transactions"],
      size : 1000 
    },
    {
      name : "Oil",
      attributes : ["date","oilprice"],
      size : 1000 
    },
    {
      name : "Holiday",
      attributes : ["date","holiday_type","locale","locale_id","transferred"],
      size : 1000 
    },
    {
      name : "R",
      attributes : ["A","B","C"],
      size : 1000 
    },
    {
      name : "S",
      attributes : ["B","D"],
      size : 1000 
    },
    {
      name : "T",
      attributes : ["A","E"],
      size : 1000 
    },
    {
      name : "U",
      attributes : ["E","F"],
      size : 1000 
    }
  ]
}

// get the join tree json
const schemaTree = {
  ...relationSchema,
  datasets: relationSchema.datasets.map(dataset => {
    return {name: dataset.name, relations: dataset.relations}
  }),
  relations: relationSchema.relations.map(rel => {
    return {
      ...rel,
      title: `${rel.name}`,
      expand: false,
      contextmenu: false,
      children: [
        {
          title: `Attributes`,
          expand: false,
          children: rel.attributes.map(v => {
            return {title: v}
          })
        },
        {
          title: `Size`,
          expand: false,
          children: [ {title: rel.size} ]
        }
      ]
    }
  })
}

export {
  schemaTree
}