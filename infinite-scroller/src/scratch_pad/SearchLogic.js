/**
 *
 *
 *   ### Line Break ###
 *
 *
 */
function initialSetup(Data = []) {
  Data.grouped = true;
  Data.currentlyGroupedOn = "tagsList"; //ex ..`tag-list` -- will be set programmatically
  Data.groupedBy_soFar = ["<field-names>", "tagsList"];
  Data.groupedBy_subHeads = {
    fieldName: ["<..subgroup-names..>"]
  };
  Data.searchString = ""; // will be set programmatically
  //TODO: DONE: bring it into play
  Data.hiddenSubgroups = { "sub-group": false };
  Data.groups = {};
  let groups = Data.groups;

  /**
   * filter to repect while preparing
   * the visible data-set
   */

  /** not using e6 - because require `this` to be Data*/
  Data.groupData = function({ fieldName, type }) {
    let len = this.length;
    let uniqueSubGroupNames = null;
    if (type === "Array") {
      /**
       * Here finding unique Group names (values) under the  given fieldName
       */
      uniqueSubGroupNames = Array.from(
        new Set(
          this.reduce((acc, item) => {
            return [...acc, ...item[fieldName]];
          }, [])
        )
      );
    } else {
      uniqueSubGroupNames = Array.from(
        new Set(
          this.reduce((acc, item) => {
            return [...acc, item[fieldName]];
          }, [])
        )
      );
    }

    /**
     * keeping all the unique group names/ values under a field-name a collection
     * this will help dictionary search the Data.groups collection for a entire group-name collection
     */

    this.groupedBy_subHeads[fieldName] = uniqueSubGroupNames; // can be one-to-one or one-to-many

    for (let i = 0; i < len; i++) {
      for (let j = 0; j < uniqueSubGroupNames.length; j++) {
        /**
         * Initialization of a `group` entry in groups dictionary
         * - it`s an array
         * - this array has a getter property called searchResult
         * */

        if (!groups[uniqueSubGroupNames[j]]) {
          let subGroupIdentifier = uniqueSubGroupNames[j];
          groups[subGroupIdentifier] = []; // creating a group entry
          groups[subGroupIdentifier].visible = true; // keeping it visible by default
          /*
            TODO:
            Can be a getter or a value
            for Search Results
    
            Somehow this needs to be throttled
            **/
          Object.defineProperty(
            groups[subGroupIdentifier],
            /* 
                Directly defining it on the group itself 
                Data Array after applying filters Namely - Arbitrary filters and Search-String
              **/ "searchResult",
            {
              get() {
                let exp = RegExp(Data.searchString);
                let dataSet = [];
                console.log(
                  `### Hidden Subgroups[${Data.hiddenSubgroups}] ###`
                );
                if (!Data.hiddenSubgroups[subGroupIdentifier]) {
                  dataSet = this.filter(item => {
                    return exp.test(item.question);
                  });
                }

                return [
                  { subGroupIdentifier, start: true },
                  ...dataSet,
                  { subGroupIdentifier, end: true }
                ];
              }
            }
          );
        }
        /**
         * END of group-entry initialization
         */

        /**
         * TODO: have to improve this group-entry array population logic
         *  - Include value type and array types only
         *  */

        if (type === "Array") {
          if (this[i][fieldName].indexOf(uniqueSubGroupNames[j]) >= 0) {
            groups[uniqueSubGroupNames[j]].push(this[i]);
          }
        } else {
          if (this[i][fieldName] === uniqueSubGroupNames[j]) {
            groups[uniqueSubGroupNames[j]].push(this[i]);
          }
        }
      }
    }
    /**
     * END - Initilization and population of the group-entries
     */
  };

  Object.defineProperty(Data, "dataSet_unGroupedData", {
    get() {
      let keys = Object.keys(this.groups);
      /**
       * Data Array after applying filters Namely - GroupedBy, Visibility and Search-String
       * Using getters on the `groups` items
       */
      return keys.reduce((accu, item) => {
        return [...accu, ...this.groups[item].searchResult];
      }, []);

      /**
       * Structure of the Array should be [...grp-start-type,obj-ref,obj-ref,grp-end-type...]
       */
    }
  });

  Object.defineProperty(Data, "dataSet_currentGroup", {
    get() {
      console.log("## Grouped by SubHeads - @@@ ##");
      console.log(Data.groupedBy_subHeads);
      let subGroups = Data.groupedBy_subHeads[Data.currentlyGroupedOn];
      console.log(`### ${Data.currentlyGroupedOn} ${subGroups} ###`);
      /**
       * Data Array after applying filters Namely - GroupedBy, Visibility and Search-String
       * Using getters on the `groups` items
       */

      return subGroups.reduce((accu, item) => {
        return [...accu, ...this.groups[item].searchResult];
      }, []);
    }
  });

  /**
   * TODO:  getters like - plainDataOnSearch, dataSet_currentGroup
   */

  Data.setSearchString = function({ searchString = "" }) {
    this.searchString = searchString;
  };
  Data.setCurrentlyGroupedOn = function({ groupBy = "" }) {
    this.currentlyGroupedOn = groupBy;
    if (this.groupedBy_soFar.indexOf(groupBy) < 0) {
      this.groupedBy_soFar.push(groupBy);
    }
  };
  Data.toggleSubGroupVisibility = function({ subGroupToHide }) {
    console.log(`#### subgroup to hide ${subGroupToHide}  ####`);
    //Right implementation => this.hiddenSubgroups[subGroupToHide] = true;
    this.hiddenSubgroups[subGroupToHide] = !this.hiddenSubgroups[
      subGroupToHide
    ];
  };
  return Data;
}

/**
 * Only working on tag-list
 * TODO: Make it group for other fields
 */

/**
 * TODO: things to polish
 *
 * 1. search results should be triggered, should be interpreted as a by-product of an event
 * 2. searches should be promised based
 * 3. a search should run parallely on various groups, the final result should be displayed after
 * few milli-seconds delay
 * 4. DONE: Group data based on different fields
 * 5. propogate state change across to search-system logic
 * 6. How to run search on when a given-group is active
 * 7. Use Loadash functions where-ever possibile - if performant
 *
 *
 *
 */

export function PrepareDataSet(rawData) {
  /**
   *  ## Follow Command Query seggregation
   */
  let Data = initialSetup(rawData);

  /**
   * TODO: DONE: This call should ideally be made from the client of the Data-set Object
   */

  console.log("Data grouped by so far");
  console.log(Data.groupedBy_soFar);

  const Proxy = {
    onSearch: (searchString, callback = null) => {
      /**
       * return the data-set => view
       */

      Data.setSearchString({ searchString });
      return Data.grouped
        ? Data.dataSet_currentGroup
        : Data.dataSet_unGroupedData;
    },

    onGroup: ({ groupBy, callBack = null }) => {
      /**
       * return the grouped-dataset
       */
      Data.setCurrentlyGroupedOn({ groupBy });
      return Data.dataSet_currentGroup;
    },
    toggleSubGroupVisibility: ({ subGroupToHide, callback = null }) => {
      /**
       * return the grouped data-set minus the data-items belonging to
       * the sub-group
       */
      Data.toggleSubGroupVisibility({ subGroupToHide });
      return Data.dataSet_currentGroup;
    },

    getGroupsAndSubgroups: () => {
      return Data.groupedBy_subHeads;
    },
    groupData(groupingFields) {
      groupingFields.forEach(item => {
        Data.groupData({ fieldName: item.fieldName, type: item.type });
      });
    }
  };

  return Proxy;
}
