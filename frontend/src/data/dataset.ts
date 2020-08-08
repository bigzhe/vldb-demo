import { RelationInfo, VariableInfo, Dataset } from "../types/Query"

const dataset: Dataset[] = [
  {
    name: "example-kmeans",
    category: "acyclic",
    dataPrepared: false,
    variableInfo: {
      "A": {
        isCategorical: true,
        dataType: "int"
      },
      "B": {
        isCategorical: true,
        dataType: "int"
      },
      "C": {
        isCategorical: true,
        dataType: "int"
      },
      "D": {
        isCategorical: true,
        dataType: "int"
      },
      "E": {
        isCategorical: true,
        dataType: "int"
      }
    },
    relations: [{
      name: "R",
      variables: ["A", "B"],
    },
    {
      name: "S",
      variables: ["B", "C"]
    },
    {
      name: "T",
      variables: ["C", "D"],
    },
    {
      name: "U",
      variables: ["D", "E"],
    }
    ]
  },
  {
    name: "4-path",
    category: "acyclic",
    dataPrepared: false,
    variableInfo: {
      "A": {
        isCategorical: true,
        dataType: "int"
      },
      "B": {
        isCategorical: true,
        dataType: "int"
      },
      "C": {
        isCategorical: true,
        dataType: "int"
      },
      "D": {
        isCategorical: true,
        dataType: "int"
      },
      "E": {
        isCategorical: true,
        dataType: "int"
      }
    },
    relations: [{
      name: "R",
      variables: ["A", "B"],
    },
    {
      name: "S",
      variables: ["B", "C"]
    },
    {
      name: "T",
      variables: ["C", "D"],
    },
    {
      name: "U",
      variables: ["D", "E"],
    }
    ]
  },
  {
    name: "5-path",
    category: "acyclic",
    dataPrepared: false,
    variableInfo: {
      "A": {
        isCategorical: true,
        dataType: "int"
      },
      "B": {
        isCategorical: true,
        dataType: "int"
      },
      "C": {
        isCategorical: true,
        dataType: "int"
      },
      "D": {
        isCategorical: true,
        dataType: "int"
      },
      "E": {
        isCategorical: true,
        dataType: "int"
      },
      "F": {
        isCategorical: true,
        dataType: "int"
      }
    },
    relations: [{
      name: "R",
      variables: ["A", "B"],
    },
    {
      name: "S",
      variables: ["B", "C"]
    },
    {
      name: "T",
      variables: ["C", "D"],
    },
    {
      name: "U",
      variables: ["D", "E"],
    },
    {
      name: "W",
      variables: ["E", "F"]
    }
    ]
  },
  {
    name: "Retailer",
    category: "real-world",
    dataPrepared: false,
    variableInfo: {
      locn: {
        isCategorical: true,
        dataType: "int"
      },
      dateid: {
        isCategorical: true,
        dataType: "int"
      },
      ksn: {
        isCategorical: true,
        dataType: "int"
      },
      inventoryunits: {
        isCategorical: false,
        dataType: "int"
      },
      zip: {
        isCategorical: false,
        dataType: "int"
      },
      rgn_cd: {
        isCategorical: false,
        dataType: "int"
      },
      clim_zn_nbr: {
        isCategorical: false,
        dataType: "int"
      },
      tot_area_sq_ft: {
        isCategorical: false,
        dataType: "int"
      },
      sell_area_sq_ft: {
        isCategorical: false,
        dataType: "int"
      },
      avghhi: {
        isCategorical: false,
        dataType: "int"
      },
      supertargetdistance: {
        isCategorical: false,
        dataType: "double"
      },
      supertargetdrivetime: {
        isCategorical: false,
        dataType: "double"
      },
      targetdistance: {
        isCategorical: false,
        dataType: "double"
      },
      targetdrivetime: {
        isCategorical: false,
        dataType: "double"
      },
      walmartdistance: {
        isCategorical: false,
        dataType: "double"
      },
      walmartdrivetime: {
        isCategorical: false,
        dataType: "double"
      },
      walmartsupercenterdistance: {
        isCategorical: false,
        dataType: "double"
      },
      walmartsupercenterdrivetime: {
        isCategorical: false,
        dataType: "double"
      },
      population: {
        isCategorical: false,
        dataType: "int"
      },
      white: {
        isCategorical: false,
        dataType: "int"
      },
      asian: {
        isCategorical: false,
        dataType: "int"
      },
      pacific: {
        isCategorical: false,
        dataType: "int"
      },
      blackafrican: {
        isCategorical: false,
        dataType: "int"
      },
      medianage: {
        isCategorical: false,
        dataType: "double"
      },
      occupiedhouseunits: {
        isCategorical: false,
        dataType: "int"
      }, 
      houseunits: {
        isCategorical: false,
        dataType: "int"
      }, 
      families: {
        isCategorical: false,
        dataType: "int"
      }, 
      households: {
        isCategorical: false,
        dataType: "int"
      }, 
      husbwife: {
        isCategorical: false,
        dataType: "int"
      }, 
      males: {
        isCategorical: false,
        dataType: "int"
      }, 
      females: {
        isCategorical: false,
        dataType: "int"
      }, 
      householdschildren: {
        isCategorical: false,
        dataType: "int"
      }, 
      hispanic: {
        isCategorical: false,
        dataType: "int"
      },
      subcategory: {
        isCategorical: true,
        dataType: "byte"
      }, 
      category: {
        isCategorical: true,
        dataType: "byte"
      }, 
      categoryCluster: {
        isCategorical: true,
        dataType: "byte"
      },
      price: {
        isCategorical: false,
        dataType: "double"
      },
      rain: {
        isCategorical: true,
        dataType: "byte"
      },
      snow: {
        isCategorical: true,
        dataType: "byte"
      },
      thunder: {
        isCategorical: true,
        dataType: "byte"
      },
      maxtemp: {
        isCategorical: false,
        dataType: "int"
      }, 
      mintemp: {
        isCategorical: false,
        dataType: "int"
      }, 
      meanwind: {
        isCategorical: false,
        dataType: "double"
      },
    },
    relations: [{
      name: "INVENTORY",
      variables: ["locn", "dateid", "ksn", "inventoryunits"],
    },
    {
      name: "LOCATION",
      variables: ["locn", "zip", "rgn_cd", "clim_zn_nbr", "tot_area_sq_ft", "sell_area_sq_ft", "avghhi", "supertargetdistance", "supertargetdrivetime", "targetdistance", "targetdrivetime", "walmartdistance", "walmartdrivetime", "walmartsupercenterdistance", "walmartsupercenterdrivetime"]
    },
    {
      name: "CENSUS",
      variables: ["zip", "population", "white", "asian", "pacific", "blackafrican", "medianage", "occupiedhouseunits", "houseunits", "families", "households", "husbwife", "males", "females", "householdschildren", "hispanic"]
    },
    {
      name: "ITEM",
      variables: ["ksn", "subcategory", "category", "categoryCluster", "price"]
    },
    {
      name: "WEATHER",
      variables: ["locn", "dateid", "rain", "snow", "maxtemp", "mintemp", "meanwind", "thunder"]
    }
    ]
  },
]

export default dataset