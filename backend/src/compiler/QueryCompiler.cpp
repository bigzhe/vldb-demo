
//--------------------------------------------------------------------
//
// QueryCompiler.cpp
//
// Created on: 07/10/2017
// Author: Max
//
//--------------------------------------------------------------------

#include <boost/dynamic_bitset.hpp>

#include <queue>

#include <QueryCompiler.h>
#include <CodegenUtils.hpp>

using namespace std;
using namespace multifaq::params;

typedef boost::dynamic_bitset<> dyn_bitset;

// #define PRINT_OUT_COMPILER
// #define PRINT_OUT_COMPILER_EXTENDED

QueryCompiler::QueryCompiler(shared_ptr<TreeDecomposition> td) : _td(td)
{
}

QueryCompiler::~QueryCompiler()
{
    for (Function* f : _functionList)
        delete f;
}

void QueryCompiler::compile()
{
    DINFO("Compiling the queries into views - number of queries: " + 
          to_string(_queryList.size())+"\n");

#ifdef PRINT_OUT_COMPILER_EXTENDED
    printf("Print list of queries to be computed: \n");
    int qID = 0;
    for (Query* q : _queryList)
    {
        printf("%d (%s): ", qID++, _td->getRelation(q->_rootID)->_name.c_str());
        for (size_t i = 0; i < NUM_OF_VARIABLES; i++)
            if(q->_fVars.test(i)) printf(" %s ",_td->getAttribute(i)->_name.c_str());
        printf(" || ");
        
        for (size_t aggNum = 0; aggNum < q->_aggregates.size(); ++aggNum)
        {
            Aggregate* agg = q->_aggregates[aggNum];
            size_t aggIdx = 0;
            for (size_t i = 0; i < agg->_agg.size(); i++)
            {
                const auto &prod = agg->_agg[aggIdx];
                for (size_t f = 0; f < NUM_OF_FUNCTIONS; f++)
                    if (prod.test(f))
                    {
                        Function* func = getFunction(f);
                        printf(" f_%lu(", f);
                        for (size_t i = 0; i < NUM_OF_VARIABLES; i++)
                            if (func->_fVars.test(i))
                                printf(" %s ", _td->getAttribute(i)->_name.c_str());
                        printf(" )");
                    }
                    ++aggIdx;
                printf(" - ");
            }
        }
        printf("\n");
    }
#endif
    
    for (Query* q : _queryList)
    {
        for (size_t agg = 0; agg < q->_aggregates.size(); ++agg)
        {
            Aggregate* aggregate = q->_aggregates[agg];

            aggregate->_incoming.push_back(
                compileViews(_td->getRelation(q->_rootID), q->_rootID,
                             aggregate->_agg, q->_fVars)
                );
        }
    }

    computeIncomingViews();

    computeViewGroups();

#ifdef PRINT_OUT_COMPILER  /* Printout */
    printf("Print list of views to be computed: \n");
    int viewID = 0;
    for (View* v : _viewList)
    {
        printf("%d (%s, %s): ", viewID++, _td->getRelation(v->_origin)->_name.c_str(),
               _td->getRelation(v->_destination)->_name.c_str());
        for (size_t i = 0; i < NUM_OF_VARIABLES; i++)
            if (v->_fVars.test(i)) printf(" %s ", _td->getAttribute(i)->_name.c_str());
        printf(" || ");

        std::string aggString = "";
        // for (size_t aggNum = 0; aggNum < v->_aggregates.size(); ++aggNum)
        // {
        //     aggString += "\n("+to_string(aggNum)+") : ";
        //     Aggregate* agg = v->_aggregates[aggNum];
        //     size_t aggIdx = 0;
        //     for (size_t i = 0; i < agg->_agg.size(); i++)
        //     {
        //         const auto &prod = agg->_agg[aggIdx];
        //         for (size_t f = 0; f < NUM_OF_FUNCTIONS; f++) {
        //             if (prod.test(f)) {
        //                 Function* func = getFunction(f);
        //                 aggString += "f_"+to_string(f)+"(";
        //                 for (size_t i = 0; i < NUM_OF_VARIABLES; i++)
        //                     if (func->_fVars.test(i))
        //                         aggString += _td->getAttribute(i)->_name;
        //                 aggString += ")*";
        //             }
        //         }
        //         aggString.pop_back();
        //         aggString += "+";
        //         ++aggIdx;
        //     }
        //     aggString.pop_back();
        //     aggString += "   ||   ";
        // }
        printf("%s -- %lu \n", aggString.c_str(),v->_aggregates.size());
    }
#endif /* Printout */

    // exit(0);
}

void QueryCompiler::addFunction(Function* f)
{
    _functionList.push_back(f);
}

void QueryCompiler::addQuery(Query* q)
{
    _queryList.push_back(q);
}

size_t QueryCompiler::numberOfViews()
{
    return _viewList.size();
}

size_t QueryCompiler::numberOfQueries()
{
    return _queryList.size();
}

size_t QueryCompiler::numberOfFunctions()
{
    return _functionList.size();
}

View* QueryCompiler::getView(size_t v_id)
{
    return _viewList[v_id];
}

Query* QueryCompiler::getQuery(size_t q_id)
{
    return _queryList[q_id];
}

Function* QueryCompiler::getFunction(size_t f_id)
{
    return _functionList[f_id];
}

pair<size_t,size_t> QueryCompiler::compileViews(
    TDNode* node, size_t targetID, vector<prod_bitset> aggregate, var_bitset freeVars)
{
    bool print = 0; // (node->_id == 2);
        
    /* Check if the required view has already been declared - if so reuse this one */
    cache_tuple t = make_tuple(node->_id, targetID, aggregate, freeVars);
    auto it = _cache.find(t);
    if (it != _cache.end())
    {
        if (print) 
            DINFO("We effectively reused an exisitng view. \n");      
        // _viewList[it->second]->_usageCount += 1;
        return it->second;
    }

    
    if (print)
    {
        DINFO("\nBeginning compileViews at node " + to_string(node->_id) + " target "+
              to_string(targetID) + " freeVars: " + freeVars.to_string() +
              " number of products: " + to_string(aggregate.size()) +"\n");

        std::string aggString = " ";
        size_t aggIdx = 0;
        for (size_t i = 0; i < aggregate.size(); i++) {
            const auto &prod = aggregate[aggIdx];
            for (size_t f = 0; f < NUM_OF_FUNCTIONS; f++) {
                if (prod.test(f)) {
                    Function* func = getFunction(f);
                    aggString += "f_"+to_string(f)+"(";
                    for (size_t i = 0; i < NUM_OF_VARIABLES; i++)
                        if (func->_fVars.test(i))
                            aggString += _td->getAttribute(i)->_name;
                    aggString += ")*";
                }
            }
            aggString.pop_back();
            aggString += " + ";
            ++aggIdx;
        }
        aggString.pop_back();
        printf("%s\n", aggString.c_str());
    }
    
    vector<prod_bitset> pushDownMask(node->_numOfNeighbors);
    prod_bitset localMask, forcedLocalFunctions, remainderMask, presentFunctions;

    // find all functions in the aggregate 
    for (size_t prod = 0; prod < aggregate.size(); prod++)
        presentFunctions |= aggregate[prod];

    for (size_t i = 0; i < NUM_OF_FUNCTIONS; i++)
    {
        if (presentFunctions[i])
        {
            // DINFO("Now considering function "+to_string(i)+" at node "+
            //       node->_name+"\n");
            
            const var_bitset& fVars = _functionList[i]->_fVars;
            bool pushedDown = false;

            /*
             * Check if that function is included in the local bag
             * - if so, then we do not push it down 
             */
            if ((node->_bag & fVars) == fVars)
            {
                // DINFO("Function "+to_string(i)+" is included in bag "+
                //       node->_name+"\n");
                /* Leave it here as local computation */
                localMask.set(i);
            }
            else
            {
                // DINFO("Function "+to_string(i)+" is NOT included in bag "+
                //       node->_name+"\n");

                /* For each child of current node */
                for (size_t c = 0; c < node->_numOfNeighbors; c++)
                {
                    // TDNode* neighbor = _td->getRelation(node->_neighbors[c]);
                
                    /* neighbor is not target! */
                    if (node->_neighbors[c] != targetID) // neyighbor->_id
                    {
                        /* childSchema contains the function then push down */
                        if ((node->_neighborSchema[c] & fVars) == fVars)
                        {
                            // DINFO("Function "+to_string(i)+" is pushed to "+
                            //       neighbor->_name+" "+to_string(c)+"\n");
                            /* push it to this child */
                            pushDownMask[c].set(i);
                            remainderMask.set(i);
                            pushedDown = true;
                            break;
                        }
                    }
                }

                if (!pushedDown)
                {
                    // DINFO("Function "+to_string(i)+" cannot be pushed below "+
                    //       node->_name+"\n");
                    /* Leave it here as local computation */
                    localMask.set(i);
                    forcedLocalFunctions.set(i);
                }
            }
        }
    }

    if (print)
        std::cout << localMask << std::endl;
    
    vector<var_bitset> pushDownFreeVars(aggregate.size(), freeVars);
    
    std::unordered_map<prod_bitset, agg_bitset> localAggMap;

    for (size_t prod = 0; prod < aggregate.size(); prod++)
    {
        // Add freeVars that do not exist in local bag to pushDownFreeVars
        prod_bitset forcedLocal = aggregate[prod] & forcedLocalFunctions;
        
        for (size_t f = 0; f < NUM_OF_FUNCTIONS; ++f)
        {
            if (forcedLocal[f])
            {
                pushDownFreeVars[prod] |=
                    _functionList[f]->_fVars & ~node->_bag;
            }
        }
        
        prod_bitset localAggregate = aggregate[prod] & localMask;
        
        // add this product to localAggregates
        auto it = localAggMap.find(localAggregate);
        if (it != localAggMap.end())
        {
            it->second.set(prod);
        }
        else
        {
            localAggMap[localAggregate] = agg_bitset().set(prod);
        }
    }

    
    /* 
     * For each product - split the functions into the ones that are pushed down
     * and the local functions 
     */
    // for (size_t prod = 0; prod < aggregate.size(); prod++)
    // {
    //     if (!visited[prod])
    //     {
    //         vector<prod_bitset> localAggregate = {aggregate[prod] & localMask};
    //         // for (size_t other = prod + 1; other < aggregate.size(); other++)
    //         // {
    //         //     /* check if prod and other share the same functions below */
    //         //     if ((aggregate[prod] & remainderMask) ==
    //         //         (aggregate[other] & remainderMask))
    //         //     {
    //         //         /* Check if the local free vars are matching */
    //         //         if (pushDownFreeVars[prod] == pushDownFreeVars[other])
    //         //         {
    //         //             /* If they match then we can combine the local
    //         //              * aggregates */
    //         //             localAggregate.push_back(aggregate[other] & localMask);
    //         //             visited.set(other);
    //         //         }
    //         //     }
    //         // }            
    //         // add this product to localAggregates
    //         auto it = localAggMap.find(localAggregate);
    //         if (it != localAggMap.end())
    //         {
    //             it->second.set(prod);
    //         }
    //         else
    //         {
    //             agg_bitset thisProd;
    //             thisProd.set(prod);
    //             localAggMap[localAggregate] = thisProd;
    //         }
    //     }
    // }
    
  
    if (print)
    {
        size_t localAggIndex = 0;
        for (pair<const prod_bitset, agg_bitset>& localAgg : localAggMap)
            std::cout << localAggIndex++ << " : " << localAgg.first 
                      << " -> " << localAgg.second << std::endl;
    }


    Aggregate* agg = new Aggregate();

    /* 
     * We now computed the local aggregates and the groups of products they
     * correspond to - now we check if we can merge several products before the
     * recursion 
     */
    size_t localAggIndex = 0;
    for (pair<const prod_bitset, agg_bitset>& localAgg : localAggMap)
    {
        if (print)
            std::cout << localAggIndex++ << " : " << localAgg.first 
                      << " -> " << localAgg.second << std::endl;
        
        for (size_t prod = 0; prod < NUM_OF_PRODUCTS; ++prod)
        {
            if (localAgg.second[prod])
            {
                if (print)
                    std::cout << prod << std::endl;
                
                // Push local aggregate on aggregate
                agg->_agg.push_back(localAgg.first);
                
                size_t neigh = 0;
                bool mergable = false;

                // Check if we can merge some of the products that need to be
                // computed below
                agg_bitset merges, candidate = localAgg.second;

                if (localAgg.second.count() > 1)
                {
                    for (neigh = 0; neigh < node->_numOfNeighbors; ++neigh)
                    {
                        for (size_t other_prod = prod+1; other_prod < NUM_OF_PRODUCTS;
                             ++other_prod)
                        {
                            if (candidate[other_prod])
                            {
                                if ((aggregate[prod] & pushDownMask[neigh]) !=
                                    (aggregate[other_prod] & pushDownMask[neigh]))
                                {
                                    if ((aggregate[prod] & ~pushDownMask[neigh]) ==
                                        (aggregate[other_prod] & ~pushDownMask[neigh]))
                                    {
                                        merges.set(other_prod);
                                        mergable = true;
                                    }

                                    candidate.reset(other_prod);
                                }
                            }
                        }

                        if (mergable)
                            break;                        
                    }
                }

                if (print && mergable)
                    std::cout << "mergeable: " << merges << std::endl;
                
                // For each neighbor compile the (merged) views and push on incoming
                for (size_t n = 0; n < node->_numOfNeighbors; ++n)
                {
                    if (node->_neighbors[n] != targetID)
                    {
                        vector<prod_bitset> childAgg =
                            {aggregate[prod] & pushDownMask[n]};
                        
                        if (mergable && n == neigh)
                        {  
                            for (size_t other = 0; other < NUM_OF_PRODUCTS; ++other)
                            {
                                if (merges[other])
                                {     
                                    /* Add mergable products to this array */
                                    childAgg.push_back(
                                        aggregate[other] & pushDownMask[n]);
                                    
                                    /* And unset for the flag in localAgg.second */
                                    localAgg.second.reset(other);
                                }
                            }
                        }

                        TDNode* neighbor = _td->getRelation(node->_neighbors[n]);

                        var_bitset neighborFreeVars =
                            ((freeVars | pushDownFreeVars[prod]) &
                             node->_neighborSchema[n]) |
                            (neighbor->_bag & node->_bag);

                        agg->_incoming.push_back(
                             compileViews(neighbor, node->_id, childAgg,
                                          neighborFreeVars));             
                    }
                }
            }
        }
    }

    /* Check here if a View with the same node, target and freeVars exists 
    - if so then we want to push the aggregate on this array 
    */
    View* view;
    view_tuple vt = make_tuple(node->_id, targetID, freeVars);
    pair<size_t, size_t> viewAggregatePair;
    
    /* Check if the required view has already been declared - if so reuse this one */
    auto view_it = _viewCache.find(vt);
    if (view_it != _viewCache.end())
    {
        view = _viewList[view_it->second];
        
        view->_aggregates.push_back(agg);

        /* Used for caching entire view and aggregate */
        viewAggregatePair =  make_pair(view_it->second, view->_aggregates.size()-1);
    }
    else
    {
        view = new View(node->_id, targetID);
        
        view->_fVars = freeVars;
        view->_aggregates.push_back(agg);

        /* Adding local view to the list of views */
        _viewList.push_back(view);

        /* Cache this view structure */
        _viewCache[vt] = _viewList.size()-1;

        /* Used for caching entire view and aggregate */
        viewAggregatePair =  make_pair(_viewList.size()-1, 0);
    }
    
    /* Adding the  view for the entire subtree to the cache */ 
    _cache[t] = viewAggregatePair;

    // DINFO("End of compileViews for "+to_string(node->_id)+" to "+
    //       to_string(targetID)+"\n");
    
    /* Return ID of this view */  
    return viewAggregatePair;    
}


void QueryCompiler::computeIncomingViews()
{
    for (size_t viewID = 0; viewID < numberOfViews(); ++viewID)
    {
        View* view = getView(viewID);
        TDNode* baseRelation = _td->getRelation(view->_origin);

        size_t numberIncomingViews =
            (view->_origin == view->_destination ? baseRelation->_numOfNeighbors :
             baseRelation->_numOfNeighbors - 1);
        
        std::vector<bool> incViewBitset(numberOfViews());
        for (size_t aggNo = 0; aggNo < view->_aggregates.size(); ++aggNo)
        {
            Aggregate* aggregate = view->_aggregates[aggNo];

            // First find the all views that contribute to this Aggregate

            size_t incOffset = 0;
            for (size_t i = 0; i < aggregate->_agg.size(); ++i)
            {
                for (size_t j = 0; j < numberIncomingViews; ++j)
                {
                    const size_t& incViewID = aggregate->_incoming[incOffset].first;
                
                    // Indicate that this view contributes to some aggregate
                    incViewBitset[incViewID] = 1;
                    ++incOffset;
                }
            }
            // for (auto& p : aggregate->_agg)
            // {
            //     for (const auto& viewAgg : p._incoming)
            //     {
            //         // Indicate that this view contributes to some aggregate
            //         incViewBitset[viewAgg.first] = 1;
            //     }
            // }
        }        
        // For each incoming view, check if it contains any vars from the
        // variable order and then add it to the corresponding info
        for (size_t incViewID=0; incViewID < numberOfViews(); ++incViewID)
            if (incViewBitset[incViewID])
                view->_incomingViews.push_back(incViewID);
    }   
}


void QueryCompiler::computeViewGroups()
{
    viewToGroupMapping = new size_t[numberOfViews()];

    std::vector<std::vector<size_t>> viewsPerNode(
        _td->numberOfRelations(), std::vector<size_t>());
    
    for (size_t viewID = 0; viewID < numberOfViews(); ++viewID)
    {
        // Keep track of the views that origin from this node 
        viewsPerNode[_viewList[viewID]->_origin].push_back(viewID);
    }
    
    /* Next compute the topological order of the views */
    dyn_bitset processedViews(numberOfViews());
    dyn_bitset queuedViews(numberOfViews());
    
    dyn_bitset incomingViews(numberOfViews());
    
    // create orderedViewList -> which is empty
    std::vector<size_t> orderedViewList;
    std::queue<size_t> nodesToProcess;
    
    // Find all views that originate from leaf nodes
    for (const size_t& nodeID : _td->_leafNodes)
    {
        for (const size_t& viewID : viewsPerNode[nodeID])
        {
            std::vector<size_t>& incViews = _viewList[viewID]->_incomingViews;
            
            if (incViews.size() == 0)
            {
                queuedViews.set(viewID);
                nodesToProcess.push(viewID);
            }
        }
    }
    
    while (!nodesToProcess.empty()) // there is a node in the set
    {
        size_t viewID = nodesToProcess.front();
        nodesToProcess.pop();

        orderedViewList.push_back(viewID);
        processedViews.set(viewID);

        const size_t& destination = _viewList[viewID]->_destination;

        // For each view that has the same destination 
        for (const size_t& destView : viewsPerNode[destination])
        {
            // check if this has not been processed (case for root nodes)
            if (!processedViews[destView])
            {
                bool candidate = true;
                for (const size_t& incView : _viewList[destView]->_incomingViews)
                {    
                    if (!processedViews[incView] && !queuedViews[incView])
                    {
                        candidate = false;
                        break;
                    }
                }
                
                if (candidate && !queuedViews[destView])
                {
                    queuedViews.set(destView);
                    nodesToProcess.push(destView);
                }
            }
        }
    }

    /* Now generate the groups of views according to topological order*/

    View* prevView = _viewList[orderedViewList[0]];
    size_t prevOrigin = prevView->_origin;

    for (size_t incViewID : prevView->_incomingViews)
        incomingViews.set(incViewID);
    
    viewGroups.push_back(
        {orderedViewList[0],_td->getRelation(prevOrigin)}
        );

    viewToGroupMapping[orderedViewList[0]] = 0;    
    size_t currentGroup = 0;
    for (size_t viewID = 1; viewID < orderedViewList.size(); ++viewID)
    {
        View* view = _viewList[orderedViewList[viewID]];
        size_t origin = view->_origin;

        if (multifaq::cppgen::MULTI_OUTPUT && prevOrigin == origin)
        {
            // Combine the two into one set of
            viewGroups[currentGroup]._views.push_back(orderedViewList[viewID]);
            viewToGroupMapping[orderedViewList[viewID]] = currentGroup;
        }
        else
        {
            for (size_t incViewID = 0; incViewID < numberOfViews(); ++incViewID)
                if (incomingViews[incViewID])
                    viewGroups[currentGroup]._incomingViews.push_back(incViewID);
            
            incomingViews.reset();
            
            // Create a new group
            viewGroups.push_back({orderedViewList[viewID],
                    _td->getRelation(_viewList[orderedViewList[viewID]]->_origin)});
            
            ++currentGroup;
            viewToGroupMapping[orderedViewList[viewID]] = currentGroup;
        }

        for (size_t incViewID : view->_incomingViews)
            incomingViews.set(incViewID);
  
        prevOrigin = origin;
    }

    /* Setting incoming views for last viewGroup */ 
    for (size_t incViewID = 0; incViewID < numberOfViews(); ++incViewID)
        if (incomingViews[incViewID])
            viewGroups[currentGroup]._incomingViews.push_back(incViewID);            

    /**************** PRINT OUT **********************/
    DINFO("Ordered View List: ");
    for (size_t& i : orderedViewList)
        DINFO(i << ", ");
    DINFO(std::endl);
    DINFO("View Groups: ");
    for (auto& group : viewGroups) {
        for (auto& i : group._views)
            DINFO(i << "  ");
        DINFO("|");
    }
    DINFO(std::endl);
    /**************** PRINT OUT **********************/
}


void QueryCompiler::test()
{
    Function* f0 = new Function({0,1}, Operation::count);
    Function* f1 = new Function({1,3}, Operation::count);
    Function* f2 = new Function({0,4}, Operation::sum);
    Function* f3 = new Function({4,5}, Operation::sum);

    Function* f4 = new Function({0,2}, Operation::count);
    Function* f5 = new Function({1,3}, Operation::sum);
    Function* f6 = new Function({1,3}, Operation::sum);
    
    // Function* f4 = new Function({4,5}, Operation::count);
    // Function* f5 = new Function({1,3}, Operation::sum);
    // Function* f6 = new Function({0,4}, Operation::sum);
    // Function* f7 = new Function({3,4}, Operation::sum);
    // Function* f8 = new Function({4,5}, Operation::count);
    // _functionList = {f0,f1,f2,f3,f4,f5,f6,f7,f8};
    _functionList = {f0,f1,f2,f3,f4,f5,f6};
    
    vector<int> prod1 = {0,1,2,3};
    vector<int> prod2 = {4,1,2,3};
    vector<int> prod3 = {0,5,2,3};
    vector<int> prod4 = {0,6,2,3};
    
    prod_bitset p1, p2, p3, p4;
    for (int i : prod1)
        p1.set(i);
    for (int i : prod2)
        p2.set(i);
    for (int i : prod3)
        p3.set(i);
    for (int i : prod4)
        p4.set(i);
    
    Aggregate* agg = new Aggregate();
    agg->_agg = {p1, p2, p3, p4};
    
    Query* faq = new Query();
    faq->_rootID = 0;
    faq->_aggregates = {agg};
    
    faq->_fVars.set(1);
    faq->_fVars.set(3);

    // faq->_freeVars = {1,3};
    // faq->_aggregate.push_back(prod1);
    // faq->_aggregate.push_back(prod2);    
    // for (auto prod : faq->_aggregate)
    // {
    //     printf("Compiling next Product: \n");
    //     faq->_incomingViews.push_back(
    //         compileViews(rootNode, rootNode->_id, prod, faq->_freeVars)
    //         );
    // }

    TDNode* rootNode = _td->getRelation(faq->_rootID);

    DINFO("Compiling Views \n");

    auto resultPair = compileViews(rootNode, rootNode->_id,
                                   faq->_aggregates[0]->_agg, faq->_fVars);
    
    agg->_incoming.push_back(resultPair);
    
    DINFO("Compiled Views - number of Views: "+to_string(_viewList.size())+"\n");
    
    int viewID = 0;
    for (View* v : _viewList)
    {
        printf("%d (%s, %s): ", viewID++, _td->getRelation(v->_origin)->_name.c_str(),
               _td->getRelation(v->_destination)->_name.c_str());
        for (size_t i = 0; i < NUM_OF_VARIABLES; i++)
            if (v->_fVars.test(i))
                printf(" %lu ", i);
        printf(" || \n");
        // string aggString = "";
        // Aggregate* agg = v->_aggregates[0];
        // size_t aggIdx = 0;
        // for (size_t i = 0; i < agg->_agg.size(); i++)
        // {
        //     // cout << "_m["+to_string(i)+"] : " << agg->_m[i] << endl;
        //     // while (aggIdx < agg->_m[i])
        //     // {
        //         auto prod = agg->_agg[aggIdx];

        //         // cout << agg->_agg.size() << "aggIndex : " << aggIdx << endl;
        //         // cout << "prod : " << prod << endl;    
              
        //         for (size_t f = 0; f < NUM_OF_FUNCTIONS; f++)
        //             if (prod.test(f))
        //                 aggString += " f_"+to_string(f);
        //         // aggString+="+";
        //         ++aggIdx;
        //     // }
        //     aggString += " - ";
        // }
        // printf("%s\n", aggString.c_str());
    }
}


std::string QueryCompiler::genViewTreeOutput() {
    std::string jsonString = "{\n";

    std::map<std::pair<int, int>, std::vector<size_t>> edgeList; 


    jsonString += offset(1)+"\"relations\": [\n";
    for (size_t rel = 0; rel < _td->numberOfRelations(); ++rel)
    {
        TDNode* node = _td->getRelation(rel); 
        jsonString += offset(2)+"{\"name\" : \""+node->_name+"\", \"id\" : "+std::to_string(node->_id)+"},\n";
    }
    jsonString += offset(1)+"],\n";

    // Generate Views and Edge List 
    std::string viewString = offset(1)+"\"views\": [\n";

    for (size_t v = 0; v < _viewList.size(); ++v)
    {
        View* view = _viewList[v];

        std::pair<int, int> edge = std::make_pair(view->_origin, view->_destination); 
        
        auto it = edgeList.find(edge);

        if (it != edgeList.end())
            it->second.push_back(v);    
        else 
            edgeList[edge] = {v}; 

        std::string groupByString = "";
        for (size_t attr = 0; attr < NUM_OF_VARIABLES; ++attr)
        {
            if (view->_fVars[attr])
                groupByString += "\""+_td->getAttribute(attr)->_name+"\",";
        }

        if (!groupByString.empty())
            groupByString.pop_back();
        
        viewString += offset(2)+"{\n"+
            offset(2)+"\"name\" : \"V"+std::to_string(v)+"\",\n"+
            offset(2)+"\"groupby\" : ["+groupByString+"],\n"+
            offset(2)+"\"aggregates\" : ["+groupByString+"],\n"+
            offset(2)+"},\n";
    }
    viewString += offset(1)+"],";

    // Generate Edges
    jsonString += offset(1)+"\"edges\": [\n";

    for (const auto edge : edgeList )
    {
        std::string origin = _td->getRelation(edge.first.first)->_name;
        std::string dest = _td->getRelation(edge.first.second)->_name;
        
        jsonString += offset(2)+"{\n"+offset(2)+"\"origin\" : \""+origin+"\",\n"+
            offset(2)+"\"dest\" : \""+dest+"\",\n"+
            offset(2)+"\"views\" : [";

        for (const size_t& viewID : edge.second)
            jsonString += "\"V"+std::to_string(viewID)+"\",";
        jsonString.pop_back();

        jsonString += "]\n"+offset(2)+"},\n";
    }

    jsonString += offset(1)+"],\n";

    jsonString += viewString+"\n"; 

    // Generate Queries
    jsonString += offset(1)+"\"queries\": [\n";

    for (size_t q = 0; q < _queryList.size(); q++)
    {
        const Query* query  = _queryList[q];

        std::string groupByString = "";
        for (size_t attr = 0; attr < NUM_OF_VARIABLES; ++attr)
        {
            if (query->_fVars[attr])
                groupByString += "\""+_td->getAttribute(attr)->_name+"\",";
        }

        if (!groupByString.empty())
            groupByString.pop_back();
        
        jsonString += offset(2)+"{\n"+
            offset(2)+"\"name\" : \"Q"+std::to_string(q)+"\",\n"+
            offset(2)+"\"groupby\" : ["+groupByString+"],\n"+
            offset(2)+"\"root\" : \""+_td->getRelation(query->_rootID)->_name+"\",\n"+
            offset(2)+"\"aggregates\" : ["+groupByString+"],\n"+
            offset(2)+"},\n";
    }
    jsonString += offset(1)+"],\n";

    jsonString += offset(1)+"\"groups\": [\n";
    for (size_t g = 0; g < viewGroups.size(); ++g)
    {
        ViewGroup& group = viewGroups[g];

        jsonString += offset(2)+"{\n"+
            offset(3)+"\"name\" : \"Group "+std::to_string(g)+"\",\n"+
            offset(3)+"\"base\" : \""+group._tdNode->_name+"\",\n"+
            offset(3)+"\"views\" : ["; 
        
        for (const size_t& view : group._views)
            jsonString += "\"V"+std::to_string(view)+"\",";
        
        jsonString.pop_back();
            
        jsonString += "]\n"+offset(2)+"},\n";
    }
    jsonString += offset(1)+"],\n";

    jsonString += offset(1)+"\"groupEdges\": [\n";

    for (size_t g = 0; g < viewGroups.size(); ++g)
    {
        ViewGroup& group = viewGroups[g];

        dyn_bitset incomingGroups(viewGroups.size());

        for (const size_t incView : group._incomingViews)
            incomingGroups.set(viewToGroupMapping[incView]);
        
        for (size_t g2 = 0; g2 < viewGroups.size(); ++g2)
            if (incomingGroups[g2])
                jsonString += offset(2)+"{\n"+
                    offset(2)+"\"origin\" : \"Group "+std::to_string(g2)+"\",\n"+
                    offset(2)+"\"dest\" : \"Group "+std::to_string(g)+"\",\n"+
                    offset(2)+"},\n";
    }

    jsonString += offset(1)+"]\n}\n";

    return jsonString;
}

std::string QueryCompiler::genViewGroupOutput() 
{
    std::string jsonString = "{\n";

    jsonString += offset(1)+"\"groups\": [\n";
    for (size_t g = 0; g < viewGroups.size(); ++g)
    {
        ViewGroup& group = viewGroups[g];

        jsonString += offset(2)+"{\n"+
            offset(3)+"\"name\" : \"Group "+std::to_string(g)+"\",\n"+
            offset(3)+"\"views\" : ["; 
        
        for (const size_t& view : group._views)
            jsonString += "V"+std::to_string(view)+",";

        jsonString.pop_back();
        jsonString += "],\n";
        
        jsonString += offset(3)+"\"incoming\" : ["; 
        dyn_bitset incomingGroups(viewGroups.size());
        for (const size_t incView : group._incomingViews)
            incomingGroups.set(viewToGroupMapping[incView]);
        
        for (size_t g = 0; g < viewGroups.size(); ++g)
            if (incomingGroups[g])
                jsonString += "\"Group "+std::to_string(g)+"\",";

        if (incomingGroups.any())
            jsonString.pop_back();
        
        jsonString += "]\n"+offset(2)+"},\n";
    }

    jsonString += offset(1)+"]\n}\n";

    return jsonString;
}

void QueryCompiler::setQueryRoot(size_t qid, size_t newRootID)
{
    _queryList[qid]->_rootID = newRootID; 
}