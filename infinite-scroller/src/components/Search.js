import React, { Component } from "react";
import { DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";
import _ from "lodash";

/**
 * ---------------------#####----------------------------*
 */
import { DataContext } from "../CONTEXT/Contexts";
import { events } from "../CONTEXT/EventEnumeration";
import Runway from "./Runway";

import { Construct_DataSet, Proxy } from "../StateManagement/DataSet";
/**
 * TODO: DONE: --
 * Create a wrapper around Data object
 * - to read data
 * - to pass search-string or any kind of filter logic trigger
 */

//let Proxy = null;

/**
 * 
 * body.dark {
    -webkit-font-smoothing: antialiased;
    --bg: #282c35;
    --header: #fff;
    --textNormal: hsla(0,0%,100%,0.88);
    --textTitle: #fff;
    --textLink: var(--pink);
    --hr: hsla(0,0%,100%,0.2);
    --inlineCode-bg: #373c49;
    --inlineCode-text: #e6e6e6;
}
 */
/**
 * Item: DONE:
 * How questions should be represented
 * {
 *    <group-id>:[..<array of question objects>...]
 *            .. : ..
 *    <group-id>:[..<array of question objects>...]
 * }
 *
 * - DONE: run filter on the object based on the <group-id>'s
 * - DONE: run `new Set ()` on the filtered data to remove any duplicates
 *   RawData => GroupedData => ApplyFilters => Views => RowWrapper => scrollLogic => RunwayIntegration
 *  */

export default class Search extends Component {
  /**
   * TODO:
   *
   * Item: DONE:Perform searches in the data directly `ApplyFilters => Views`
   * Item: DONE: Pass these Views through the Context API Provider model
   * Item: Throttle searches
   * Item: <Runway2/> can be the return value of a functional component
   * Item: DONE:Make Search as the connected component or a context driven component
   * Item: How will you integrate this with the available app
   *
   *
   *
   *
   *
   *
   * Design:
   *
   *  - DONE: Provide a config object as a prop
   *  - DONE: Config object will hold the search data as a property value
   *  - DONE: Config Object should provide data-item structure {fields}
   *  - DONE: what fields to group data on
   *  - DND Integration
   *
   * <SearchPanel config={{
   *   data:[...10k objects...]
   *   data-item-structure:{f1,f2,f3,f4} or [f1,f2,f3,f4...]
   *   group-on-fields : [f1,f2,f3]
   *   search-fields:[f1,f2,f3]
   *   Design: DONE: Use Set and Array operations to filter data on desired fields
   *
   * }}/>
   *
   * SearchPanel => Compose{ <Runway2/> wrapped by HOC    }
   *
   *
   */
  state = {
    activeTabKey: 0, // tagList, field-name
    searchString: "",
    eventFired: events.none, // hide,unhide,tab-change,search
    dataSet: Construct_DataSet(this.props.data.table)
      .groupData(this.props.groupOnFields)
      .onSearch("")
  };

  fireEvent({ eventName, payload }) {
    console.log("@ eventName payload");
    console.log(eventName, payload);

    if (eventName === events.search) {
      this.setState({
        eventFired: eventName,
        searchString: payload,
        dataSet: Proxy.onSearch(payload)
      });
    } else if (eventName === events.hide) {
      console.log("### hide called ###");
      this.setState({
        eventFired: eventName,
        dataSet: Proxy.toggleSubGroupVisibility({ subGroupToHide: payload })
      });
    } else if (eventName === events.ungrouped) {
      this.setState({
        eventFired: eventName,
        dataSet: [] // TODO:Implement function to do the same
      });
    } else if (eventName === events.group) {
      this.setState({
        eventFired: eventName,
        dataSet: Proxy.onGroup({ groupBy: payload })
      });
    }
  }

  tabChange(evt, tabName, indx) {
    //console.log("tabchange was fired...." + indx);
    /**
     * put logic to change data in the context
     * depending on the tab pressed
     */
    //this.setState({ activeTabKey: indx });
    console.log(`tabName is ${tabName}`);
    this.setState({
      activeTabKey: indx
    });
    this.fireEvent({ eventName: events.group, payload: tabName });
  }

  componentDidUpdate() {
    console.log("@@@ Component Did update");
  }

  render() {
    console.log("@@@ Component Did render @@@");

    console.log(Proxy.getGroupsAndSubgroups());

    return (
      <React.Fragment>
        <DndProvider backend={Backend}>
          <div className="search-component">
            <DataContext.Provider value={this.state.dataSet}>
              <div>
                <title>Search</title>
                <input
                  type="text"
                  className="search-class"
                  onChange={evt => {
                    this.fireEvent({
                      eventName: events.search,
                      payload: evt.target.value
                    });
                  }}
                  value={this.state.searchString}
                />
                <button
                  onClick={() => {
                    this.fireEvent({
                      eventName: events.search,
                      payload: this.state.searchString
                    });
                  }}
                >
                  Click Me
                </button>
              </div>
              <div className="tabs">
                {this.props.tabs.map((tabName, indx) => {
                  return (
                    <div
                      key={indx}
                      className={`tab ${
                        indx === this.state.activeTabKey ? "active-tab" : ""
                      }`}
                      onClick={evt => {
                        this.tabChange(evt, tabName, indx);
                      }}
                    >
                      {tabName}
                    </div>
                  );
                })}
              </div>
              <Runway
                triggerEvent={({ eventName, payload }) => {
                  this.fireEvent({ eventName, payload });
                }}
              />
            </DataContext.Provider>
          </div>
        </DndProvider>
      </React.Fragment>
    );
  }
}
