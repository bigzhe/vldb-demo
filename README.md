# vldb-demo
VLDB Demo

Check the demo page at https://bigzhe.github.io/vldb-demo/.

## Project setup

```
cd frontend

# install dependencies
npm install

# compiles and hot-reloads for development
npm run serve
```

Access the pages at http://localhost:8080/#/

You could modify the source files, such as adding text, and the page will reloaded automatically to reflect the modifications. 


## Project structure

Currently most of the files are for the sigmod demo rather than the vldb demo. I haven't been able to peel off them cleanly. The program connot compile if I delete them. Hence, I leave them there, and point out the files that are relevant to the vldb demo.

The folder `frontend/src/data` contains the files for importing data and converting data to the format required by d3.
Currently, the data is imported directly from the mockup data files in the folder `mockdata`. The data will be from LMFAO in the future. 
The file for converting the data to the format required by d3 is `joinTree.js`. It is the only file related to vldb demo. 

The folder `frontend/src/util/d3` contains the d3 scripts for generating the svg plots from the formatted data. 
The only file related to vldb demo is `showJoinTree.js`, which is for generating the join tree plot in the view generation tab. 

The folder `frontend/src/components` contains the http template files for the tabs -- `Dataset.vue` is for the input tab and `ViewGeneration.vue` is for the view generation tab. 
They are like placeholders for the plot and text that will be generated from the input data. 
