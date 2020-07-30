//--------------------------------------------------------------------
//
// Launcher.cpp
//
// Created on: 30 Nov 2017
// Author: Max
//
//--------------------------------------------------------------------

#include <Count.h>
#include <CovarianceMatrix.h>
#include <CppGenerator.h>
#include <DataCube.h>
#include <KMeans.h>
#include <Launcher.h>
#include <LinearRegression.h>
#include <MutualInformation.h>
#include <RegressionTree.h>
#include <Percentile.h>
#include <SqlGenerator.h>

#include <bitset>
#include <fstream>

std::string multifaq::config::FEATURE_CONF = "";
std::string multifaq::config::TREEDECOMP_CONF = "";
std::string multifaq::config::SCHEMA_CONF = "";

std::string multifaq::dir::PATH_TO_DATA = "";
std::string multifaq::dir::PATH_TO_FILES = "";
std::string multifaq::dir::DATASET_NAME = "";
std::string multifaq::dir::OUTPUT_DIRECTORY = "";

bool multifaq::cppgen::MULTI_OUTPUT;
bool multifaq::cppgen::RESORT_RELATIONS;
bool multifaq::cppgen::MICRO_BENCH;
bool multifaq::cppgen::COMPRESS_AGGREGATES;
bool multifaq::cppgen::BENCH_INDIVIDUAL;

multifaq::cppgen::PARALLELIZATION_TYPE multifaq::cppgen::PARALLEL_TYPE;

using namespace multifaq::params;
using namespace multifaq::config;
using namespace std;
using namespace std::chrono;

Launcher::Launcher() 
{
}

Launcher::~Launcher()
{
}

shared_ptr<QueryCompiler> Launcher::getCompiler()
{
    return _compiler;
}

shared_ptr<TreeDecomposition> Launcher::getTreeDecomposition()
{
    return _treeDecomposition;
}

shared_ptr<Application> Launcher::getApplication()
{
    return _application;
}

shared_ptr<CodeGenerator> Launcher::getCodeGenerator()
{
    return _codeGenerator;
}

std::string Launcher::launch(const std::string selectedDataset, const std::string selectedModel) // boost::program_options::variables_map& vm
{

    multifaq::dir::PATH_TO_DATA = "../data/"+selectedDataset;
    multifaq::dir::PATH_TO_FILES = multifaq::dir::PATH_TO_DATA; 
    multifaq::dir::DATASET_NAME = selectedDataset; 
    multifaq::dir::OUTPUT_DIRECTORY = "runtime/"; 

    /* Define the Feature Conf File */
    FEATURE_CONF = multifaq::dir::PATH_TO_FILES+"/"+"features.conf"; 
    // multifaq::dir::PATH_TO_FILES+"/"+vm["feat"].as<std::string>(); 

    /* Define the TreeDecomposition Conf File */
    TREEDECOMP_CONF = multifaq::dir::PATH_TO_FILES+"/"+"treedecomposition.conf";
     //multifaq::dir::PATH_TO_FILES+"/"+vm["td"].as<std::string>();

    const string model = selectedModel; // vm["model"].as<std::string>();
    
    const string codeGenerator = "cpp"; //vm["codegen"].as<std::string>();
    
    // multifaq::cppgen::PARALLELIZATION_TYPE parallelization_type =
    // std::string parallel = vm["parallel"].as<std::string>();   
    // if (parallel.compare("task") == 0)
    //     parallelization_type =  multifaq::cppgen::TASK_PARALLELIZATION;
    // else if (parallel.compare("domain") == 0)
    //     parallelization_type =  multifaq::cppgen::DOMAIN_PARALLELIZATION;
    // else if (parallel.compare("both") == 0)
    //     parallelization_type = multifaq::cppgen::BOTH_PARALLELIZATION;
    // else if (parallel.compare("none") != 0)
    //     ERROR("ERROR - We only support task and/or domain parallelism. "<<
    //           "We continue single threaded.\n\n");

    // multifaq::cppgen::RESORT_RELATIONS = vm.count("resort");

    multifaq::cppgen::MULTI_OUTPUT = true; 
    // (vm["mo"].as<bool>()) && !multifaq::cppgen::RESORT_RELATIONS;

    multifaq::cppgen::MICRO_BENCH = true; // vm.count("microbench");

    multifaq::cppgen::COMPRESS_AGGREGATES = true; // vm["compress"].as<bool>();
    
    multifaq::cppgen::BENCH_INDIVIDUAL = true; // vm.count("bench_individual");

    multifaq::cppgen::PARALLEL_TYPE =  multifaq::cppgen::BOTH_PARALLELIZATION;

    /* TODO: when this gets fixed, degree needs to be passed to relevant models. */
    // if (vm["degree"].as<int>() > 1)
    //     ERROR("A degree > 1 is currenlty not supported.\n");

    /* Build tree decompostion. */
    _treeDecomposition.reset(new TreeDecomposition());

    DINFO("INFO: Built the TreeDecomposition.\n");

    int64_t start = duration_cast<milliseconds>(
        system_clock::now().time_since_epoch()).count();

    _compiler.reset(new QueryCompiler(_treeDecomposition));
    
    DINFO("INFO: Building the Application " << model << ".\n");

    bool hasApplicationHandler = false;
    bool hasDynamicFunctions = false;
    
    if (model.compare("reg") == 0)
    {
        _application.reset(
            new LinearRegression(shared_from_this()));
        hasApplicationHandler = true;
    }
    else if (model.compare("rtree") == 0)
    {
        _application.reset(
            new RegressionTree(shared_from_this(), false));
        hasApplicationHandler = true;
        hasDynamicFunctions = true;
    }
    else if (model.compare("ctree") == 0)
    {
        _application.reset(
            new RegressionTree(shared_from_this(), true));
        hasApplicationHandler = true;
        hasDynamicFunctions = true;
    }
    else if (model.compare("covar") == 0)
    {
        _application.reset(
            new CovarianceMatrix(shared_from_this()));
        hasApplicationHandler = true;
    }
    else if (model.compare("count") == 0)
    {
        _application.reset(
            new Count(shared_from_this()));
        hasApplicationHandler = true;
    }
    else if (model.compare("cube") == 0)
    {
        _application.reset(
            new DataCube(shared_from_this()));
    }
    else if (model.compare("mi") == 0)
    {
        _application.reset(
            new MutualInformation(shared_from_this()));
    }
    else if (model.compare("perc") == 0)
    {
        _application.reset(
            new Percentile(shared_from_this()));
        hasApplicationHandler = true;
    }
    else if (model.compare("kmeans") == 0)
    {
        // TODO: SET KAPPA CORRECTLY 
        size_t clusters = 5; 

        // size_t kappa = vm["clusters"].as<size_t>();
        // if (vm.count("kappa"))
        //     kappa = vm["kappa"].as<size_t>();

        _application.reset(new KMeans(shared_from_this(), clusters, clusters));
        hasApplicationHandler = true;
    }
    else
    {
        ERROR("The model "+model+" is not supported. \n");
        exit(1);
    }    
    _application->run();

    DINFO("INFO: Start QueryCompiler.\n");

    // COMPILE VIEW TREE 
    _compiler->compile();

    DINFO("INFO: End QueryCompiler.\n");

    // _codeGenerator.reset(new CppGenerator(shared_from_this()));    
    // _codeGenerator->generateCode(hasApplicationHandler, hasDynamicFunctions);

    // if (hasApplicationHandler)
    //     _application->generateCode();
    
    int64_t processingTime = duration_cast<milliseconds>(
        system_clock::now().time_since_epoch()).count() - start;

    size_t numOfViews = _compiler->numberOfViews();    
    size_t numOfQueries = _compiler->numberOfQueries();

    size_t numOfGroups = 0; // _codeGenerator->numberOfGroups();

    size_t finalNumberOfAggregates = 0;
    size_t totalNumberOfAggregates = 0;
    for (size_t v = 0; v < numOfViews; ++v)
    {
        View* view = _compiler->getView(v);
        
        if (view->_origin == view->_destination)
            finalNumberOfAggregates += view->_aggregates.size();
        
        totalNumberOfAggregates += view->_aggregates.size();
    }
    
    /* Write loading times times to times file */
    ofstream ofs("compiler-data.out", std::ofstream::out);// | std::ofstream::app);
    
    if (ofs.is_open())
    {   
        ofs << "aggs\tfinAgg\tqueries\tviews\tgroups\ttime" << std::endl;
        ofs << totalNumberOfAggregates << "\t"
            << finalNumberOfAggregates << "\t"
            << numOfQueries <<"\t"
            << numOfViews <<"\t"<< numOfGroups <<"\t"
            << processingTime << std::endl;
    }
    else
        cout << "Unable to open compiler-data.out \n";
    
    ofs.close();
    
    // BINFO(
    // 	"Time for Compiler: " + to_string(processingTime) + "ms.\n");
    
    return _compiler->genViewTreeOutput();
}

std::string Launcher::regenerateViews(const std::vector<size_t> &rootAssignments)
{
    // TODO:  assert(rootAssignments.size() == _compiler->numberOfQueries());
    
    for (size_t qid = 0; qid < _compiler->numberOfQueries(); qid++)
    {
        const size_t& rootID = rootAssignments[qid];
        _compiler->setQueryRoot(qid, rootID);
    }

    // TODO: need to call compile !! 

    // This means we also need to clean up the existing queries / views ! 

    return _compiler->genViewTreeOutput();
}


std::string Launcher::generateViewGroups()
{
    return _compiler->genViewGroupOutput();
}


