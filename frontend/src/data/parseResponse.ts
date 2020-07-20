const { response } = require('./response')
// response = response.replace(/\n/g, '')

const parseArray = function (text: string): number[] {
	return text.replace('[', '').replace(']', '').trim().split(' ').map(n => parseFloat(n))
}

const parse1DMap = function (text: string): { x: string, val: number }[][] {
	// console.log({text})

	// const maps: {[v: number]: number}[] = []
	const maps: { x: string, val: number }[][] = []
	const succinctText = text.trim().replace(/^\[/, '').replace(/\]$/, '')

	succinctText.split(/\n/).forEach(line => {

		line = line.replace('[', '').replace(']', '').trim()
		// console.log({line})	

		const map: { x: string, val: number }[] = []
		// const map: {[v: number]: number} = {}
		line.split(', ').forEach(s => {
			const xs = s.split(' -> ')
			if (xs.length == 2) {
				// map[parseInt(xs[0])] = parseInt(xs[1])
				map.push({
					x: `${parseInt(xs[0])}`,
					val: parseFloat(xs[1])
				})
			} else {
				// console.log('error: ', xs)
			}
		})
		// 有些可能是空的
		if (map.length !== 0) {
			maps.push(map)
		}
	})


	return maps
}


const parse2DMap = function (text: string): { x: string, y: string, val: number }[][] {
	// console.log({text})

	const maps: { x: string, y: string, val: number }[][] = []
	const succinctText = text.trim().replace(/^\[/, '').replace(/\]$/, '')

	succinctText.split(/\n/).forEach(line => {

		line = line.replace('[', '').replace(']', '').trim()
		// console.log({line})	

		// const map: {[v: number]: {[v2: number]: number}} = {}
		const map: { x: string, y: string, val: number }[] = []

		const re = /\([0-9]*, [0-9]*\) -> [0-9]*/g


		let m = null
		do {
			m = re.exec(line)
			// console.log({m})
			if (m) {
				const xs = m[0].split(' -> ')
				const tuple = xs[0]
				const [v1, v2] = tuple.replace('(', "").replace(')', '').split(', ')
				// if (!map[parseInt(v1)]) {
				// map[parseInt(v1)] = {}
				// }
				// map[parseInt(v1)][parseInt(v2)] = parseInt(xs[1])
				map.push({
					x: `${parseInt(v1)}`,
					y: `${parseInt(v2)}`,
					val: parseInt(xs[1])
				})
			}
		} while (m)

		// line.split(', ').forEach(s => {
		// 	const xs = s.split(' -> ')
		// 	if (xs.length == 2) {
		// 		const tuple = xs[0]
		// 		const [v1, v2] = tuple.replace('(', "").replace(')', '').split(', ')
		// 		map[parseInt(v1)][parseInt(v2)] = parseInt(xs[1])
		// 	} else {
		// 		console.log('error: ', xs)
		// 	}
		// })
		// 有些可能是空的
		if (Object.keys(map).length !== 0) {
			maps.push(map)
		}
	})


	return maps
}


const parse1DMIMap = function (text: string): { [v: number]: number }[] {
	// console.log({text})

	const maps: { [v: number]: number }[] = []
	// const maps: {x: string, val: number}[][] = []
	const succinctText = text.trim().replace(/^\[/, '').replace(/\]$/, '')

	succinctText.split(/\n/).forEach(line => {

		line = line.replace('[', '').replace(']', '').trim()
		// console.log({line})	

		// const map: {x: string, val: number}[] = []
		const map: { [v: number]: number } = {}
		line.split(', ').forEach(s => {
			const xs = s.split(' -> ')
			if (xs.length == 2) {
				map[parseInt(xs[0])] = parseInt(xs[1])
				// map.push({
				// 	x: `${parseInt(xs[0])}`, 
				// 	val: parseInt(xs[1])
				// })
			} else {
				// console.log('error: ', xs)
			}
		})
		// 有些可能是空的
		if (Object.keys(map).length !== 0) {
			maps.push(map)
		}
	})


	return maps
}

const parse2DMIMap = function (text: string): { [v: number]: { [v2: number]: number } }[] {
	// console.log({text})

	const maps: { [v: number]: { [v2: number]: number } }[] = []
	const succinctText = text.trim().replace(/^\[/, '').replace(/\]$/, '')

	succinctText.split(/\n/).forEach(line => {

		line = line.replace('[', '').replace(']', '').trim()
		// console.log({line})	

		const map: { [v: number]: { [v2: number]: number } } = {}
		// const map: {x: string, y: string, val: number}[] = []

		const re = /\([0-9]*, [0-9]*\) -> [0-9]*/g


		let m = null
		do {
			m = re.exec(line)
			// console.log({m})
			if (m) {
				const xs = m[0].split(' -> ')
				const tuple = xs[0]
				const [v1, v2] = tuple.replace('(', "").replace(')', '').split(', ')
				if (!map[parseInt(v1)]) {
					map[parseInt(v1)] = {}
				}
				map[parseInt(v1)][parseInt(v2)] = parseInt(xs[1])
				// map.push({
				// 	x: `${parseInt(v1)}`,
				// 	y: `${parseInt(v2)}`,
				// 	val: parseInt(xs[1])
				// })
			}
		} while (m)

		// 有些可能是空的
		if (Object.keys(map).length !== 0) {
			maps.push(map)
		}
	})


	return maps
}



export type parseResult = {
	IDX: number,
	count: number,
	cont_sum1: number[],
	cont_sum2: number[],
	cont_degree2: number[],
	cat_sum1: { x: string, val: number }[][],
	cat_sum2: { x: string, val: number }[][],
	cat_degree2: { x: string, y: string, val: number }[][],
	cont_cat_degree2: { x: string, val: number }[][],
	cont_params: number[],
	cat_params: { x: string, val: number }[][],
	tN: number,
}

export function parseResponse(response: string): parseResult {

	const IDX: number = parseInt(/<IDX>(.*)<\/IDX>/.test(response) ? RegExp.$1 : "0")
	const count: number = parseInt(/<count>(.*)<\/count>/.test(response) ? RegExp.$1 : "0")

	const cont_sum1: number[] = parseArray(/<cont_sum1\.data\(\)>(.*)<\/cont_sum1\.data\(\)>/.test(response) ? RegExp.$1 : "[]")

	const cont_sum2 = parseArray(/<cont_sum2\.data\(\)>(.*)<\/cont_sum2\.data\(\)>/.test(response) ? RegExp.$1 : "[]")

	const cont_degree2 = parseArray(/<cont_degree2\.data\(\)>(.*)<\/cont_degree2\.data\(\)>/.test(response) ? RegExp.$1 : "[]")

	const cat_sum1 = parse1DMap(/<cat_sum1\.data\(\)>((.|\n)*)<\/cat_sum1\.data\(\)>/m.test(response) ? RegExp.$1 : "[]")

	const cat_sum2 = parse1DMap(/<cat_sum2\.data\(\)>((.|\n)*)<\/cat_sum2\.data\(\)>/m.test(response) ? RegExp.$1 : "[]")

	const cat_degree2 = parse2DMap(/<cat_degree2\.data\(\)>((.|\n)*)<\/cat_degree2\.data\(\)>/m.test(response) ? RegExp.$1 : "[]")

	const cont_cat_degree2 = parse1DMap(/<cont_cat_degree2\.data\(\)>((.|\n)*)<\/cont_cat_degree2\.data\(\)>/m.test(response) ? RegExp.$1 : "[]")

	const cont_params = parseArray(/<contParams>((.|\n)*)<\/contParams>/m.test(response) ? RegExp.$1 : "[]")

	const cat_params = parse1DMap(/<catParams>((.|\n)*)<\/catParams>/m.test(response) ? RegExp.$1 : "[]")

	const tN: number = parseInt(/<tN>(.*)<\/tN>/.test(response) ? RegExp.$1 : "0")

	const res = {
		IDX,
		count,
		cont_sum1,
		cont_sum2,
		cont_degree2,
		cat_sum1,
		cat_sum2,
		cat_degree2,
		cont_cat_degree2,
		cont_params,
		cat_params,
		tN,
	}

	return res
}

export type parseMIResult = {
	count: number;
	cat_sum1: {
		[v: number]: number;
	}[];
	cat_sum2: {
		[v: number]: number;
	}[];
	cat_degree2: { x: string, y: string, val: number }[][],
}

export function parseMIResponse(response: string): parseMIResult {

	// console.log(response)

	const count: number = parseInt(/<count>(.*)<\/count>/.test(response) ? RegExp.$1 : "0")

	const cat_sum1 = parse1DMIMap(/<cat_sum1\.data\(\)>((.|\n)*)<\/cat_sum1\.data\(\)>/m.test(response) ? RegExp.$1 : "[]")

	const cat_sum2 = parse1DMIMap(/<cat_sum2\.data\(\)>((.|\n)*)<\/cat_sum2\.data\(\)>/m.test(response) ? RegExp.$1 : "[]")

	const cat_degree2 = parse2DMap(/<cat_degree2\.data\(\)>((.|\n)*)<\/cat_degree2\.data\(\)>/m.test(response) ? RegExp.$1 : "[]")

	const res = {
		// IDX,
		count,
		// cont_sum1,
		// cont_sum2,
		// cont_degree2,
		cat_sum1,
		cat_sum2,
		cat_degree2,
		// cont_cat_degree2,
	}

	return res
}



// console.log(JSON.stringify(res))


// console.log({
//   IDX,
//   count,
//   cont_sum1: cont_sum1.length,
//   cont_sum2: cont_sum2.length,
//   cont_degree2: cont_degree2.length,
// 	cat_sum1: cat_sum1.length,
// 	cat_sum2: cat_sum2.length,
// 	cat_degree2: cat_degree2.length,
// 	cont_cat_degree2: cont_cat_degree2.length,
// })



// while (true) {
//   let result = varIterator.next();
//   if (result.done) break;
//   console.log(result.value); // outputs characters one by one
// }









