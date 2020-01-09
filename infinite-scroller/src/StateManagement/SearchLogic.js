/**[
  {
    tagsList: ["new", "test"],
    responseId: null,
    questionId: "a128A0000018AVcQAM",
    questionExtId: "QB000002",
    question: "test 123",
    qType: "Text",
    lastModifiedDate: "2019-12-30 11:26:22",
    createdBy: "User User"
  },
  
];*/

/**  Represent data as flat array
 
 *
 * Data.visibleData = a getter() -- will apply the filters and present the final  immutable list
 *
 * whenever applying the filter -- assign length to zero
 *
 *
 *
 *
 * Frame Logic:::-> can be shifted to Search (Parent Component)
 * - Assume it to be contigous array of elements
 * - Calculate starting and ending indexes of the frame
 * - Translate frame-indexes to group-indexes
 *   - Apply filters
 *
 *       => If the group is toggled-show OR toggled-hide
 *            ==> Then shift / un-shift the index reads by the length of the group
 *       => If Searching
 *            => If grouped data
 *            => filtered Items
 *            => respect Hidden groups
 * - Read the data
 * - while rendering check for filters like
 *
 * **/

/**
 * running grouping logic on rawData
 */
/**
 * Design: Data item order has to be maintained between searches
 *
 */

/**
 * Translation starts from this point onwards
 */
/**
 * ## TODO: Make `Data` immutable
 *
 * ## TODO: Check trie -- if we can base it on a trie structure
 *
 * ## TODO: Not feasible: Cache for All ready filtered data
 *
 * ##  TODO: Wrapper for the data
 */

function initialSetup(Data = []) {
  Data.grouped = true;
  Data.currentlyGroupedOn = "tagsList"; //ex ..`tag-list` -- will be set programmatically

  Data.groupedBy_soFar = ["<field-names>", "tagsList"];
  Data.groupedBy_subHeads = {
    fieldName: ["<..subgroup-names..>"]
  };
  Data.searchString = ""; // "Text Question - 2"; // will be set programmatically

  /**
   * filter to repect while preparing
   * the visible data-set
   */
  //TODO: bring it into play
  Data.hiddenSubgroups = { "sub-group": false };
  // Array seems to be a bad choice ["an array of subgroup names /identifier"];

  Data.groups = {};
  let groups = Data.groups;
  //let Data = rawData.table;

  /** not using e6 - because require `this` to be Data*/
  Data.groupData = function({ fieldName, type }) {
    let len = this.length;
    let uniqueGroupNames = null;
    if (type === "Array") {
      /**
       * Here finding unique Group names (values) under the  given fieldName
       */
      uniqueGroupNames = Array.from(
        new Set(
          this.reduce((acc, item) => {
            return [...acc, ...item[fieldName]];
          }, [])
        )
      );
    } else {
      uniqueGroupNames = Array.from(
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

    this.groupedBy_subHeads[fieldName] = uniqueGroupNames; // can be one-to-one or one-to-many

    for (let i = 0; i < len; i++) {
      for (let j = 0; j < uniqueGroupNames.length; j++) {
        /**
         * Initialization of a `group` entry in groups dictionary
         * - it`s an array
         * - this array has a getter property called searchResult
         * */

        if (!groups[uniqueGroupNames[j]]) {
          let groupIdentifier = uniqueGroupNames[j];
          groups[groupIdentifier] = []; // creating a group entry
          groups[groupIdentifier].visible = true; // keeping it visible by default
          /*
            TODO:
            Can be a getter or a value
            for Search Results
    
            Somehow this needs to be throttled
            **/
          Object.defineProperty(
            groups[groupIdentifier],
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
                if (!Data.hiddenSubgroups[groupIdentifier]) {
                  dataSet = this.filter(item => {
                    return exp.test(item.question);
                  });
                }

                return [
                  { groupIdentifier, start: true },
                  ...dataSet,
                  { groupIdentifier, end: true }
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
          if (this[i][fieldName].indexOf(uniqueGroupNames[j]) >= 0) {
            groups[uniqueGroupNames[j]].push(this[i]);
          }
        } else {
          if (this[i][fieldName] === uniqueGroupNames[j]) {
            groups[uniqueGroupNames[j]].push(this[i]);
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

  // Data.untoggleSubGroupVisibility = function({ subGroupToUnhide }) {
  //   this.hiddenSubgroups[subGroupToUnhide] = false;
  // };

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
   * if require any transformations
   *
   * TRANSFORMATIONS come here
   *
   */
  /**
   *  ## Follow Command Query seggregation
   */
  let Data = initialSetup(rawData);

  /**
   * TODO: This call should ideally be made from the client of the Data-set Object
   */
  // Data.groupData({ fieldName: "tagsList", type: "Array" });
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
      //...Data.groupData({ fieldName: "tagsList", type: "Array" });
      groupingFields.forEach(item => {
        Data.groupData({ fieldName: item.fieldName, type: item.type });
      });
      // Memory consideration
      //Data.length = 0;
    }
  };

  return Proxy;
}
