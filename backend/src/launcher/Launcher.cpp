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
    if (launcherInitialized)
        return _compiler->genViewTreeOutput();

    multifaq::dir::PATH_TO_DATA = "../data/"+selectedDataset;
    multifaq::dir::PATH_TO_FILES = multifaq::dir::PATH_TO_DATA;
    multifaq::dir::DATASET_NAME = selectedDataset;
    multifaq::dir::OUTPUT_DIRECTORY = "runtime/";

    /* Define the Feature Conf File */
    FEATURE_CONF = multifaq::dir::PATH_TO_FILES+"/features.conf";

    /* Define the TreeDecomposition Conf File */
    TREEDECOMP_CONF = multifaq::dir::PATH_TO_FILES+"/treedecomposition.conf";

    const string model = selectedModel; // vm["model"].as<std::string>();

    const string codeGenerator = "cpp"; //vm["codegen"].as<std::string>();

    multifaq::cppgen::MULTI_OUTPUT = true;

    multifaq::cppgen::MICRO_BENCH = false;

    multifaq::cppgen::COMPRESS_AGGREGATES = true; // vm["compress"].as<bool>();

    multifaq::cppgen::BENCH_INDIVIDUAL = false; // vm.count("bench_individual");

    multifaq::cppgen::PARALLEL_TYPE =  multifaq::cppgen::NO_PARALLELIZATION; // multifaq::cppgen::BOTH_PARALLELIZATION;

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

    generateApplicationHandler = hasApplicationHandler;

    _application->run();

    DINFO("INFO: Start QueryCompiler.\n");

    // COMPILE VIEW TREE 
    _compiler->compile();

    DINFO("INFO: End QueryCompiler.\n");

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

    launcherInitialized = true;

    // BINFO(
    // 	"Time for Compiler: " + to_string(processingTime) + "ms.\n");
    // _application->generateApplicationOutput();

    return _compiler->genViewTreeOutput();
}


void Launcher::generateCode()
{
    if (!launcherInitialized)
    {
        std::cerr << "You need to first initialize LMFAO" << std::endl;
        return;
    }

    std::cout << "Generating code to: "<<
        multifaq::dir::OUTPUT_DIRECTORY << std::endl;

    bool hasDynamicFunctions = false;

    _codeGenerator.reset(new CppGenerator(shared_from_this()));

    _codeGenerator->generateCode(
        generateApplicationHandler, hasDynamicFunctions);

    if (generateApplicationHandler)
        _application->generateCode();
}


std::string Launcher::regenerateViews(const std::vector<size_t> &rootAssignments)
{
    if (!launcherInitialized)
    {
        std::cerr << "You need to first initialize LMFAO" << std::endl;
        return "";
    }

    // assert(rootAssignments.size() == _compiler->numberOfQueries());

    for (size_t qid = 0; qid < _compiler->numberOfQueries(); qid++)
    {
        const size_t& rootID = rootAssignments[qid];
        _compiler->setQueryRoot(qid, rootID);
    }

    // CLEAR VIEW TREE 
    _compiler->clear();

    // COMPILE VIEW TREE 
    _compiler->compile();

    return _compiler->genViewTreeOutput();
}


std::string Launcher::generateViewGroups()
{
    return _compiler->genViewGroupOutput();
}

inline std::string offset(size_t off)
{
    return std::string(off*3,' ');
}

/**
 * Returns the JSON string of the Application Output
 */
std::string Launcher::generateApplicationOutput()
{
    return _application->generateApplicationOutput();
}
