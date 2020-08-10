export const mockJoinTree = {
   "relations": [{
         "name": "R",
         "id": 0
      },
      {
         "name": "S",
         "id": 1
      },
      {
         "name": "T",
         "id": 2
      },
      {
         "name": "U",
         "id": 3
      },
   ],
   "edges": [
      {
         "origin": "R",
         "dest": "R",
         "views": ["V3", "V7", "V8", "V9"]
      },
      {
         "origin": "R",
         "dest": "S",
         "views": ["V10"]
      },
      {
         "origin": "R",
         "dest": "T",
         "views": ["V12"]
      },
      {
         "origin": "S",
         "dest": "R",
         "views": ["V0", "V4"]
      },
      {
         "origin": "S",
         "dest": "S",
         "views": ["V11"]
      },
      {
         "origin": "T",
         "dest": "R",
         "views": ["V2", "V6"]
      },
      {
         "origin": "T",
         "dest": "T",
         "views": ["V13"]
      },
      {
         "origin": "T",
         "dest": "U",
         "views": ["V14"]
      },
      {
         "origin": "U",
         "dest": "T",
         "views": ["V1", "V5"]
      },
      {
         "origin": "U",
         "dest": "U",
         "views": ["V15"]
      },
   ],
   "views": [{
         "name": "V0",
         "groupby": ["A", "B", "cluster_D"],
         "aggregates": ["A", "B", "cluster_D"],
      },
      {
         "name": "V1",
         "groupby": ["E", "cluster_F"],
         "aggregates": ["E", "cluster_F"],
      },
      {
         "name": "V2",
         "groupby": ["A", "cluster_E", "cluster_F"],
         "aggregates": ["A", "cluster_E", "cluster_F"],
      },
      {
         "name": "V3",
         "groupby": ["cluster_A", "cluster_B", "cluster_C", "cluster_D", "cluster_E", "cluster_F"],
         "aggregates": ["cluster_A", "cluster_B", "cluster_C", "cluster_D", "cluster_E", "cluster_F"],
      },
      {
         "name": "V4",
         "groupby": ["A", "B"],
         "aggregates": ["A", "B"],
      },
      {
         "name": "V5",
         "groupby": ["E"],
         "aggregates": ["E"],
      },
      {
         "name": "V6",
         "groupby": ["A"],
         "aggregates": ["A"],
      },
      {
         "name": "V7",
         "groupby": ["A"],
         "aggregates": ["A"],
      },
      {
         "name": "V8",
         "groupby": ["B"],
         "aggregates": ["B"],
      },
      {
         "name": "V9",
         "groupby": ["C"],
         "aggregates": ["C"],
      },
      {
         "name": "V10",
         "groupby": ["A", "B"],
         "aggregates": ["A", "B"],
      },
      {
         "name": "V11",
         "groupby": ["D"],
         "aggregates": ["D"],
      },
      {
         "name": "V12",
         "groupby": ["A"],
         "aggregates": ["A"],
      },
      {
         "name": "V13",
         "groupby": ["E"],
         "aggregates": ["E"],
      },
      {
         "name": "V14",
         "groupby": ["E"],
         "aggregates": ["E"],
      },
      {
         "name": "V15",
         "groupby": ["F"],
         "aggregates": ["F"],
      },
   ],
   "queries": [{
         "name": "Q0",
         "groupby": ["cluster_A", "cluster_B", "cluster_C", "cluster_D", "cluster_E", "cluster_F"],
         "root": "R",
         "aggregates": ["cluster_A", "cluster_B", "cluster_C", "cluster_D", "cluster_E", "cluster_F"],
      },
      {
         "name": "Q1",
         "groupby": ["A"],
         "root": "R",
         "aggregates": ["A"],
      },
      {
         "name": "Q2",
         "groupby": ["B"],
         "root": "R",
         "aggregates": ["B"],
      },
      {
         "name": "Q3",
         "groupby": ["C"],
         "root": "U",
         "aggregates": ["C"],
      },
      {
         "name": "Q4",
         "groupby": ["D"],
         "root": "R",
         "aggregates": ["D"],
      },
      {
         "name": "Q5",
         "groupby": ["E"],
         "root": "S",
         "aggregates": ["E"],
      },
      {
         "name": "Q6",
         "groupby": ["F"],
         "root": "T",
         "aggregates": ["F"],
      },
   ],
   "groups": [{
         "name": "Group 0",
         "views": ["V0", "V4"],
         relation : "R"
      },
      {
         "name": "Group 1",
         "views": ["V1", "V5"],
         relation : "R"
      },
      {
         "name": "Group 2",
         "views": ["V12"],
         relation : "R"
      },
      {
         "name": "Group 3",
         "views": ["V2", "V6", "V13", "V14"],
         relation : "R"
      },
      {
         "name": "Group 4",
         "views": ["V3", "V7", "V8", "V9", "V10"],
         relation : "R"
      },
      {
         "name": "Group 5",
         "views": ["V15"],
         relation : "R"
      },
      {
         "name": "Group 6",
         "views": ["V11"],
         relation : "R"
      },
   ],
   "groupEdges": [{
         "origin": "Group 0",
         "dest": "Group 2",
      },
      {
         "origin": "Group 1",
         "dest": "Group 3",
      },
      {
         "origin": "Group 2",
         "dest": "Group 3",
      },
      {
         "origin": "Group 0",
         "dest": "Group 4",
      },
      {
         "origin": "Group 3",
         "dest": "Group 4",
      },
      {
         "origin": "Group 3",
         "dest": "Group 5",
      },
      {
         "origin": "Group 4",
         "dest": "Group 6",
      },
   ]
}