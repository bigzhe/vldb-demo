const _ = require("lodash")

const relationSchema = {
  datasets: [
    {
      name : "Retailer",
      relations : ["Inventory", "Item", "Location",  "Census", "Weather"]
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
      joinAttributes : ["locn","dateid","ksn"],
      size : "84,055,817 tuples,  1.5GB"
    },
    {
      name : "Location",
      attributes : ["locn","zip","rgn_cd","clim_zn_nbr","tot_area_sq_ft","sell_area_sq_ft","avghhi","supertargetdistance","supertargetdrivetime","targetdistance","targetdrivetime","walmartdistance","walmartdrivetime","walmartsupercenterdistance","walmartsupercenterdrivetime"],
      joinAttributes : ["locn","zip"],
      size : "1317 tuples,   131KB"
    },
    {
      name : "Census",
      attributes : ["zip","population","white","asian","pacific","black","medianage","occupiedhouseunits","houseunits","families","households","husbwife","males","females","householdschildren","hispanic"],
      joinAttributes : ["zip"],
      size : "1,302 tuples,  104 KB"
    },
    {
      name : "Item",
      attributes : ["ksn","subcategory","category","categoryCluster","prize"],
      joinAttributes : ["ksn"],
      size : "5,618 tuples,  128KB" 
    },    {
      name : "Weather",
      attributes : ["locn","dateid","rain","snow","maxtemp","mintemp","meanwind","thunder"],
      joinAttributes : ["locn", "dateid"],
      size : "1,159,457 tuples,  32MB" 
    },
    {
      name : "Store",
      attributes : ["a", "b", "c"],      
      joinAttributes : [],
      size : ["1000"]
    },
    {
      name : "Sales",
      attributes : ["date","store","item","unit_sales","onpromotion"],
      joinAttributes : [],
      size : ["1000"]
    },
    {
      name : "Stores",
      attributes : ["store","city","state","store_type","cluster"],
      joinAttributes : [],
      size : ["1000"]
    },
    {
      name : "Items",
      attributes : ["item","family","itemclass","perishable"],
      joinAttributes : [],
      size : ["1000"]
    },
    {
      name : "Transactions",
      attributes : ["date","store","transactions"],
      joinAttributes : [],
      size : ["1000"]
    },
    {
      name : "Oil",
      attributes : ["date","oilprice"],
      joinAttributes : [],
      size : ["1000"]
    },
    {
      name : "Holiday",
      attributes : ["date","holiday_type","locale","locale_id","transferred"],
      joinAttributes : [],
      size : ["1000"]
    },
    {
      name : "R",
      attributes : ["A","B","C"],
      joinAttributes : [],
      size :  ["1000"]
    },
    {
      name : "S",
      attributes : ["B","D"],
      joinAttributes : [],
      size :  ["1000"]
    },
    {
      name : "T",
      attributes : ["A","E"],
      joinAttributes : [],
      size :  ["1000"]
    },
    {
      name : "U",
      attributes : ["E","F"],
      joinAttributes : [],
      size :  ["1000"]
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
          title: `Attributes: `+(rel.attributes.join(", ")),
          expand: false,
          // children: rel.attributes.map(v => {
          //   return {title: v}
          // })
        },
        {
          title: `Join Attributes: `+(rel.joinAttributes.join(", ")),
          expand: false,
          // children: rel.attributes.map(v => {
          //   return {title: v}
          // })
        },
        {
          title: `Size: `+rel.size,
          expand: false,
          // children: rel.size.map(v => {
          //   return {title: v}
          // })
        }
      ]
    }
  })
}

export {
  schemaTree
}