#ifndef APPLICATION_HPP
#define APPLICATION_HPP

#include <iostream>
#include <vector>

#include <GlobalParams.hpp>
#include <Launcher.h>
#include <Logging.hpp>

class LMFAO {

public:

    LMFAO() { }

    ~LMFAO() {  }

    std::string launch(std::string dataset, std::string model);

    std::string process_next_batch(std::string msg);

    std::string regenerateViews(const std::vector<size_t>& rootAssignments);

protected:

    /* Launcher for LMFAO */
    std::shared_ptr<Launcher> _launcher;

/*
    std::vector<std::unique_ptr<IRelation>> relations;
    Multiplexer static_multiplexer;
    Multiplexer dynamic_multiplexer;

    void init_relations();

    void load_relations();

    void clear_relations();

    void init_dispatchers(dbtoaster::data_t& data);

    void clear_dispatchers();

    void process_tables(dbtoaster::data_t& data);

    void process_on_system_ready(dbtoaster::data_t& data);

    void process_streams(dbtoaster::data_t& data);

    void process_streams_snapshot(dbtoaster::data_t& data, long snapshot_interval);

    void process_streams_no_snapshot(dbtoaster::data_t& data);

    void on_snapshot(dbtoaster::data_t& data);

    std::string on_snapshot_result(dbtoaster::data_t& data, std::vector<int> features, size_t labelIdx);

    void on_begin_processing(dbtoaster::data_t& data);

    void on_end_processing(dbtoaster::data_t& data, bool print_result);

    void print_result(dbtoaster::data_t& data);
 */
  
};

std::string LMFAO::launch(std::string dataset, std::string model) {
    std::cout << "-------------" << std::endl;
    std::cout << "Launching Server. " << std::endl;
    std::cout << "-------------" << std::endl;

    /* Create Launcher */
    _launcher.reset(new Launcher());

    // dataset = "example-kmeans";
    // model = "kmeans";

    /* Run Launcher */
    std::string viewTree =  _launcher->launch(dataset,model);

    // std::vector<size_t> rootAssignments(7, 0); 
    // std::cout << _launcher->regenerateViews(rootAssignments) << std::endl;

    // std::cout << viewTree << std::endl;
    return viewTree; 
}

std::string LMFAO::process_next_batch(std::string msg) {

    std::cout << "-------------" << std::endl;
    std::cout << "Processing Batch " << msg << std::endl;
    std::cout << "-------------" << std::endl;

    return msg+"[success]";
}


std::string LMFAO::regenerateViews(const std::vector<size_t>& rootAssignments) {

    std::cout << "-------------" << std::endl;
    std::cout << "Processing Batch " << std::endl;
    std::cout << "-------------" << std::endl;

    return _launcher->regenerateViews(rootAssignments);
};


#endif /* APPLICATION_HPP */