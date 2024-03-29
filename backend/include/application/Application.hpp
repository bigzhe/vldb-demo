//--------------------------------------------------------------------
//
// Application.hpp
//
// Created on: 11 December 2017
// Author: Max
//
//--------------------------------------------------------------------

#ifndef INCLUDE_APPLICATION_APPLICATION_HPP_
#define INCLUDE_APPLICATION_APPLICATION_HPP_

#include <array>
#include <memory>

#include <CompilerUtils.hpp>
#include <GlobalParams.hpp>
#include <Logging.hpp>
#include <QueryCompiler.h>
#include <TDNode.hpp>
#include <TreeDecomposition.h>

struct Feature
{
    var_bitset head;
    size_t body[multifaq::params::NUM_OF_VARIABLES] = {};
};


/**
 * Abstract class to provide a uniform interface used to process the received data.
 */
class Application
{

public:

    virtual ~Application()
    {
    }
    
    /**
     * Runs the data processing task.
     */
    virtual void run() = 0;

    var_bitset getFeatures()
    {
        return _features;
    }

    virtual void generateCode() = 0;

    virtual std::string generateApplicationOutput() 
    {
        return "[no_model]";
    }; 
    
protected:

    var_bitset _features;
    var_bitset _isFeature;
    var_bitset _isCategoricalFeature;

    std::vector<Feature> _listOfFeatures;

    inline std::string offset(size_t off)
    {
        return std::string(off*3, ' ');
    }

    std::string typeToStr(Type t)
    {
        switch(t)
        {
        case Type::Integer : return "int";
        case Type::Double : return "double";            
        case Type::Short : return "short";
        case Type::U_Integer : return "size_t";
        default :
            ERROR("This type does not exist \n");
            exit(1);
        }
    }
    
    std::string exec(const char* cmd) 
    {
        std::array<char, 128> buffer;
        std::string result;
        std::unique_ptr<FILE, decltype(&pclose)> pipe(popen(cmd, "r"), pclose);
        if (!pipe) {
            throw std::runtime_error("popen() failed!");
        }
        while (fgets(buffer.data(), buffer.size(), pipe.get()) != nullptr) {
            result += buffer.data();
        }
        return result;
    }
};

#endif /* INCLUDE_APPLICATION_APPLICATION_HPP_ */
