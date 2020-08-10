#include <stdio.h>
#include <string.h>
// #include "mongoose.h"

#include <iostream>
#include <sstream>
#include <algorithm>

// #include "application/application.hpp"
#include "LMFAO.hpp"
#include "../mongoose/mongoose.h"

LMFAO app;

// static struct mg_serve_http_opts s_http_server_opts;

// static void ev_handler(struct mg_connection *c, int ev, void *p) {
//   if (ev == MG_EV_HTTP_REQUEST) {
//     struct http_message *hm = (struct http_message *) p;

//     std::string uri (hm->uri.p, (int)hm->uri.len);
//     std::string returnMsg = app.process_next_batch(uri); 

//     // We have received an HTTP request. Parsed request is contained in `hm`.
//     // Send HTTP reply to the client which shows full original request.
//     mg_send_head(c, 200, returnMsg.length(), "Content-Type: text/plain");
//     mg_printf(c, "%s", returnMsg.c_str());
//   }
// }

static void regenViews_handler(struct mg_connection *c, int ev, void *p) {
  
  if (ev == MG_EV_HTTP_REQUEST) {
    struct http_message *hm = (struct http_message *) p;

    std::string uri (hm->uri.p, (int)hm->uri.len);

    if (uri[0] == '/') 
      uri.erase(0,1); 

    std::cout << "URI: " << uri << std::endl; 

    std::stringstream stream(uri);
    std::string substr;
    getline(stream, substr, '/'); //get first directory

    std::cout << "Request: " << substr << std::endl; 

    std::string returnMsg;

    if (substr.compare("init") == 0)
    {
      std::string dataset; 
      getline(stream, dataset, ','); 

      std::string model; 
      getline(stream, model, ','); 

      std::cout << "Launching LMFAO with dataset " <<
        dataset << " and model " << model << std::endl; 
      
      returnMsg = app.launch(dataset, model);
    }
    else if (substr.compare("regen") == 0)
    {
      // std::cout << "New root assignments: ";
      std::vector<size_t> rootAssignment;
      while(stream.good()) {
        std::string substr;
        getline(stream, substr, ','); //get first string delimited by comma
        rootAssignment.push_back(std::stoi(substr));
        // std::cout << substr  << ", ";
      }

      // std::cout << std::endl;
      returnMsg = app.regenerateViews(rootAssignment);
    }
    else if (substr.compare("codegen") == 0)
    {
        app.generateCode();
    }
    else if (substr.compare("runapp") == 0)
    {
        returnMsg = app.runApplication();
    }
    else 
    {
      std::cout << "We are not sure what to do with "<< uri << std::endl;
      exit(1);
    }

    std::cout << uri << std::endl;

    // We have received an HTTP request. Parsed request is contained in `hm`.
    // Send HTTP reply to the client which shows full original request.
    mg_send_head(c, 200, returnMsg.length(), "Content-Type: text/plain");
    mg_printf(c, "%s", returnMsg.c_str());
  }
}

int main(void)
{
  // TODO: REMOVE and CLEANUP app->launch
  // app.launch("favorita", "kmeans");
  // app.generateCode();
  // exit(1);

  struct mg_mgr mgr;
  struct mg_connection *nc;

  mg_mgr_init(&mgr, NULL);

  printf("Starting web server on port 8081\n");

  nc = mg_bind(&mgr, "8081", regenViews_handler);
  
  if (nc == NULL) {
    printf("Failed to create listener\n");
    return 1;
  }

  // Set up HTTP server parameters
  mg_set_protocol_http_websocket(nc);

  // s_http_server_opts.document_root = ".";  // Serve current directory
  // s_http_server_opts.enable_directory_listing = "yes";

  // Serve request. Hit Ctrl-C to terminate the program
  for (;;) {
    mg_mgr_poll(&mgr, 1000);
  }

  mg_mgr_free(&mgr);

  return 0;

  /*  
  struct mg_server *server;

  // Create and configure the mgr
  server = mg_create_server(NULL);
  mg_set_option(server, "listening_port", "8081");
  mg_add_uri_handler(server, "/", index_html);

  // Serve request. Hit Ctrl-C to terminate the program
  printf("Starting on port %s\n", mg_get_option(server, "listening_port"));
  for (;;) {
    mg_poll_server(server, 1000);
  }

  // Cleanup, and free server instance
  mg_destroy_server(&server);

  return 0;
  */
}