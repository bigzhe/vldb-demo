//--------------------------------------------------------------------
//
// Launcher.h
//
// Created on: 30 Nov 2017
// Author: Max
//
//--------------------------------------------------------------------

#ifndef INCLUDE_RUN_LAUNCHER_H_
#define INCLUDE_RUN_LAUNCHER_H_

#include <boost/program_options.hpp>

#include <Application.hpp>
#include <CodeGenerator.hpp>
#include <GlobalParams.hpp>
#include <Logging.hpp>
#include <QueryCompiler.h>
#include <TreeDecomposition.h>

/**
 * Class that takes care of assembling the different components of the database
 * and launching the tasks.
 */
class Launcher: public std::enable_shared_from_this<Launcher>
{
public:

    /**
     * Constructor; need to provide path to the schema, table and other
     * configuration files.
     */
    Launcher();

    ~Launcher();

    /**
     * Launches the database operations.
     */
    std::string launch(const std::string selectedDataset, const std::string selectedModel); // boost::program_options::variables_map& vm);
    
    /**
     * Returns a pointer to the tree decomposition.
     */
    std::shared_ptr<TreeDecomposition> getTreeDecomposition();
    
    /**
     * Returns a pointer to the application.
     */
    std::shared_ptr<Application> getApplication();

    /**
     * Returns a model identifier.
     */
    // Model getModel();

    /**
     * Returns a pointer to the Query Compiler.
     */
    std::shared_ptr<QueryCompiler> getCompiler();

    /**
     * Returns a pointer to the Code Generator.
     */
    std::shared_ptr<CodeGenerator> getCodeGenerator();

    /**
     * Returns the JSON string of the ViewTree
     */
    std::string regenerateViews(const std::vector<size_t>& rootAssignments);

    /**
     * Returns the JSON string of the ViewGroups
     */
    std::string generateViewGroups();

    /**
     * Generates the C++ code
     */
    void generateCode(); 

private:

    //! Query Compiler that turns queries into views. 
    std::shared_ptr<QueryCompiler> _compiler;

    //! Model to be computed of the database.
    std::shared_ptr<Application> _application;

    //! Engine module of the database.
    std::shared_ptr<TreeDecomposition> _treeDecomposition;

    //! Engine module of the database.
    std::shared_ptr<CodeGenerator> _codeGenerator;
    
    //! Path to the files used by the database.
    std::string _pathToFiles;

    //! Path to the files used by the database.
    std::string _outputDirectory;

    bool launcherInitialized = false; 

    bool generateApplicationHandler = false; 
        
};

#endif // INCLUDE_RUN_LAUNCHER_H_
