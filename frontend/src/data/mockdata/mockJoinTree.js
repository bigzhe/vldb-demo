export const mockJoinTree = {
	"relations": [
		{"name" : "Inventory"},
		{"name" : "Stores"},
		{"name" : "Weather"},
		{"name" : "Items"}
	],
	"edges": [
		{
		"origin" : "Stores", 
		"dest" : "Inventory",
		"views" : ["V1", "V2"] 
		},
		{
		"origin" : "Weather", 
		"dest" : "Inventory",
		"views" : ["V3", "V4", "V5"] 
		},
		{
		"origin" : "Items", 
		"dest" : "Inventory",
		"views" : ["V6"] 
		},
		{
		"origin" : "Inventory", 
		"dest" : "Stores",
		"views" : ["V7", "V8"] 
		},
		{
		"origin" : "Inventory", 
		"dest" : "Items",
		"views" : ["V9", "V10"] 
		},
		{
		"origin" : "Inventory", 
		"dest" : "Weather",
		"views" : ["V11"] 
		}
	],
	"views": [
		{"V1" : "V1(store, SUM(1))"}, 
		{"V2" : "V2(store, type, SUM(1))"}, 
		{"V3" : "V3(date, store, SUM(1))"}, 
		{"V4" : "V4(date, store, rain, SUM(1))"}, 
		{"V5" : "V5(date, store, snow, SUM(1))"}, 
		{"V6" : "V6(item, SUM(1))"}, 
		{"V7" : "V7(store, SUM(1))"}, 
		{"V8" : "V8(store, SUM(1))"}, 
		{"V9" : "V9(item,  SUM(1))"}, 
		{"V10" : "V10(item, type, SUM(1))"}, 
		{"V11" : "V11(date, store, SUM(1))"}
	]
}

