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

/**  Represent data as a flat array, with start and stop flag for a group
 
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
 * Design: Data item order has to be maintained between searches
 **
 * ## TODO: Make `Data` immutable
 *
 * ## TODO: Check trie -- if we can base it on a trie structure
 *
 * ## TODO: Not feasible: Cache for Already filtered data
 *
 * ## TODO: Wrapper for the data
 */

class Data_Set extends Array {
  /**Class Properties -- */
  grouped = true;
  currentlyGroupedOn = "tagsList"; //ex ..`tag-list` -- will be set programmatically
  groupedBy_soFar = ["<field-names>", "tagsList"];
  groupedBy_subHeads = {
    fieldName: ["<..subgroup-names..>"]
  };
  searchString = ""; // will be set programmatically
  //TODO: DONE: bring it into play
  hiddenSubgroups = { "sub-group": false };
  groups = {};

  /**Class Methods -- */

  /**
   * filter to repect while preparing
   * the visible data-set
   */

  constructor(Data) {
    super();
    Object.assign(this, Data);
  }

  /** not using e6 - because require `this` to be Data*/
  groupData({ fieldName, type }) {
    let len = this.length;
    let uniqueSubGroupNames = null;
    let groups = this.groups;
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
              get: () => {
                let exp = RegExp(this.searchString);
                let dataSet = [];
                console.log(
                  `### Hidden Subgroups[${this.hiddenSubgroups}] ###`
                );
                if (!this.hiddenSubgroups[subGroupIdentifier]) {
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
  }
  setSearchString({ searchString = "" }) {
    this.searchString = searchString;
  }
  setCurrentlyGroupedOn({ groupBy = "" }) {
    this.currentlyGroupedOn = groupBy;
    if (this.groupedBy_soFar.indexOf(groupBy) < 0) {
      this.groupedBy_soFar.push(groupBy);
    }
  }
  toggleSubGroupVisibility({ subGroupToHide }) {
    console.log(`#### subgroup to hide ${subGroupToHide}  ####`);
    //Right implementation => this.hiddenSubgroups[subGroupToHide] = true;
    this.hiddenSubgroups[subGroupToHide] = !this.hiddenSubgroups[
      subGroupToHide
    ];
  }

  get dataSet_unGroupedData() {
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
  get dataSet_currentGroup() {
    console.log("## Grouped by SubHeads - @@@ ##");
    console.log(this.groupedBy_subHeads);
    let subGroups = this.groupedBy_subHeads[this.currentlyGroupedOn];
    console.log(`### ${this.currentlyGroupedOn} ${subGroups} ###`);
    /**
     * Data Array after applying filters Namely - GroupedBy, Visibility and Search-String
     * Using getters on the `groups` items
     */

    return subGroups.reduce((accu, item) => {
      return [...accu, ...this.groups[item].searchResult];
    }, []);
  }
}






class Data_Set_Wrapper {
  constructor(rawData) {
    this.data = new Data_Set(rawData);
  }
  onSearch(searchString, callback = null) {
    /**
     * return the data-set => view
     */
    let Data = this.data;
    Data.setSearchString({ searchString });
    return Data.grouped
      ? Data.dataSet_currentGroup
      : Data.dataSet_unGroupedData;
  }
  onGroup({ groupBy, callBack = null }) {
    /**
     * return the grouped-dataset
     */
    let Data = this.data;
    Data.setCurrentlyGroupedOn({ groupBy });
    return Data.dataSet_currentGroup;
  }
  toggleSubGroupVisibility({ subGroupToHide, callback = null }) {
    /**
     * return the grouped data-set minus the data-items belonging to
     * the sub-group
     */
    let Data = this.data;
    Data.toggleSubGroupVisibility({ subGroupToHide });
    return Data.dataSet_currentGroup;
  }
  getGroupsAndSubgroups() {
    let Data = this.data;
    return Data.groupedBy_subHeads;
  }
  groupData(groupingFields) {
    let Data = this.data;
    groupingFields.forEach(item => {
      Data.groupData({ fieldName: item.fieldName, type: item.type });
    });
    return this;
  }
}

export const Proxy = {};
export const Construct_DataSet = rawData => {
  let wrappedObj = new Data_Set_Wrapper(rawData);
  Proxy.__proto__ = wrappedObj;
  return Proxy;
};
