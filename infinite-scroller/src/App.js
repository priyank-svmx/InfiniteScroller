import React from "react";
import rawData from "./CONTEXT/DATA";
import "./App.css";

import Search from "./components/Search";

function App() {
  return (
    <>
      <div className="App-header">
        <span>Start - List-Runway</span>
        <Search
          data={rawData}
          groupOnFields={[
            {
              fieldName: "tagsList",
              type: "Array"
            },
            {
              fieldName: "qType",
              type: "String"
            }
          ]}
          tabs={["tagsList", "qType"]}
          searchField={["question"]}
        />

        <span>End - List-Runway</span>
      </div>
    </>
  );
}

export default App;
