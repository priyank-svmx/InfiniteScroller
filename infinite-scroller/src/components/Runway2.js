import React, { Component } from "react";
import _ from "lodash";
import { ItemTypes } from "../CONTEXT/DraggableTypes";
import { useDrag } from "react-dnd";

import { DataContext } from "../CONTEXT/available_contexts";
import { events } from "../CONTEXT/EventEnumeration";

/**
 * ____BUG____
 * Saving scroll-position for various tabs -
 * - if scrolling in one tab should not effect scroll position of the other tabs
 * - Scroll should be smooth when moving down on the list
 *
 */

function Row(props) {
  const {
    rowIndex,
    rowText,
    key,
    subGroupHead,
    styleObj,
    toggleVisibility
  } = props;
  const [{ isDragging }, drag] = useDrag({
    item: { type: ItemTypes.ROW },
    collect: monitor => ({
      isDragging: !!monitor.isDragging()
    })
  });
  return (
    <div
      className={`runway-row ${subGroupHead ? "grp-head" : ""}`}
      key={key}
      style={styleObj}
      onClick={toggleVisibility ? toggleVisibility : null}
    >
      {`${rowText} ${rowIndex}`}
    </div>
  );
}
/**
 * Design:
 *
 * Item: Group toggle - save as state < which-group-id, group-height/translation-delta>
 * Item: Throttle - onScroll
 * Item: Integrate - react beautiful DND
 * Item: Search - a question / a group + a question / a question on a grouped data
 * Item: A higher order component should compose with runway and provide search capability
 *       sub-item: The result of the search should be fed into the `runway` component
 *
 * Improvement:
 *
 * Item: Data Consumption -
 * should read only from the (data-item) indexes allowed to appear in the visible frame at
 * any time during scroll.
 * LIMITED reads
 *
 * Item:
 * Runway should work with any kind of component underlying the RowWrapper
 *
 * Item:
 * How questions should be represented
 * {
 *    <group-id>:[..<array of question objects>...]
 *            .. : ..
 *    <group-id>:[..<array of question objects>...]
 * }
 * OR
 * Represent data as flat array
 * Data =[];
 * Data.grouped = true or false;
 * Data.searchString = ``;
 * Data["<group_id>"] = <some-index>;
 * Data[<some-index] = [.... question data .....];
 * MetaInfo = Data2[<some-index];
 * MetaInfo.show = either "true" or "false";
 * MetaInfo.GroupId = Data["<group_id>"];
 * MetaInfo.filteredData = [... filtered data for that group ...]
 *
 * Frame Logic:::-> can be shifted to Search (Parent Component)
 * - Assume it to be contigous array of elements
 * - Calculate starting and ending indexes of the frame
 * - Translate frame-indexes to group-indexes
 *   - Apply filters
 *       => If grouped data being displayed then there would be one extra row-entry to signal start of the group
 *       => If the group is toggled-show OR toggled-hide
 *            ==> Then shift / un-shift the index reads by the length of the group
 *       => If Searching
 *            => If grouped data
 *            => filtered Items
 *            => respect Hidden groups
 * - Read the data
 * - while rendering check for filters like
 *
 *
 * - run filter on the object based on the <group-id>'s
 * - run `new Set ()` on the filtered data to remove any duplicates
 *   RawData => GroupedData => ApplyFilters => Views => RowWrapper => scrollLogic => RunwayIntegration
 *  */

/**
 * FIXME: DONE: throttled scroll event
 *
 * TODO: DONE: Row wrapper and limited dom nodes window size - while scrolling up or down
 *
 * TODO: Data hose - Viewport size of records to siphon through at Scroll
 *
 * TODO: Remove event from the event pool
 *
 *  */
export default class Runway2 extends Component {
  state = {
    sentinel_Y: 700,
    rowHeight: 50, //TODO: some logic to calculate the row height
    scrollLocation: {
      scrollTop: 0,
      clientHeight: 600
    }
    /**
     * Improvement: DONE:
     * move the group state info to
     * the parent above ..
     * let the parent decide which groups to show
     * and the items in the group
     *
     *TODO: <DISCARDED!!>
     *How to decide the group-height? at the parent level or within the runway
     **/

    // toggled: {
    //   latest_toggled: "<group-id>",
    //   "<group-id>": "true-false  if `falsy` then accordion is toggled-in"
    // }
  };

  constructor(props) {
    super(props);
    //this.throttledOnScroll = _.throttle(this.onScroll.bind(this), 200);
  }

  increaseRunwayScrollHeight() {
    this.setState({
      sentinel_Y: this.state.scrollLocation.scrollHeight + 400
    });
  }

  /**
   * RowWrapper - responsible for spatial placement of the wrapped row
   */
  RowWrapper({ rowIndex, rowText, key, subGroupHead = false }) {
    let styleObj = {
      transform: `translateY(${rowIndex * this.state.rowHeight}px)`
    };

    return (
      <Row
        rowIndex={rowIndex}
        rowText={rowText}
        key={key}
        subGroupHead={subGroupHead}
        styleObj={styleObj}
        toggleVisibility={
          subGroupHead
            ? () => {
                console.log("head clicked");
                this.props.triggerEvent({
                  eventName: events.hide,
                  payload: rowText
                });
              }
            : null
        }
      />
    );
  }

  RowFrame() {
    /**
     * Rows to be rendered - a Frame of visible rows
     */
    let DATA = this.context;
    let frameRange = this.frameRange(this.state.scrollLocation);
    let frame = [];
    let dataItem = null;

    /** TODO: Array slice can be used to get the required data set and then map over it */
    for (let i = frameRange[0], j = 0; i <= frameRange[1]; i++, j++) {
      /**
       * if frame-range is greater than Data-set length, then break the loop;
       */
      if (i > DATA.length - 1) {
        break;
      }

      dataItem = DATA[i];
      if (dataItem.subGroupIdentifier && dataItem.end) {
        /** Don't create react-element for group-end-tag */
        continue;
      }
      frame.push(
        this.RowWrapper({
          rowIndex: i,
          rowText: dataItem.subGroupIdentifier
            ? dataItem.subGroupIdentifier
            : dataItem.question,
          key: j,
          subGroupHead: dataItem.subGroupIdentifier ? true : false
        })
      );
    }
    return frame;
  }

  // Improvement: BAD-NAME: `scrollLocation` && frameRange - improve to a better name
  frameRange(scrollLocation) {
    /**
     * index range - from which data would be read and represented as rows
     */
    // assumption: row height = 50px
    // assumption: total number of rows = 10,000
    let { scrollTop, clientHeight, scrollHeight } = scrollLocation;
    let arr = [];
    for (let i = 0; i < 10000; i++) {
      if (Math.abs(i * 50 - scrollTop) <= clientHeight + 50) {
        arr.push(i);
      }
    }
    return [arr[0], arr[0] + arr.length];
  }

  onScroll(evt) {
    //console.log(evt);
    let scrollTop = evt.nativeEvent.target.scrollTop;
    let clientHeight = evt.nativeEvent.target.clientHeight;
    let scrollHeight = evt.nativeEvent.target.scrollHeight;
    /**
     * informing the component regarding the
     * present scroll-location
     */
    this.setState({
      scrollLocation: {
        scrollTop,
        clientHeight,
        scrollHeight
      }
    });
    if (scrollTop + clientHeight >= scrollHeight) {
      this.increaseRunwayScrollHeight();
    }
  }

  render() {
    console.log("How state tree looks like after every render");
    console.log(this.state);
    return (
      <React.Fragment>
        <div className="runway-viewport">
          <div
            className="runway-row-container"
            onScroll={evt => this.onScroll(evt)}
          >
            <div
              className="runway-sentinel"
              style={{
                transform: `translate(0px,${this.state.sentinel_Y}px)`
              }}
            ></div>
            {this.RowFrame()}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

Runway2.contextType = DataContext;
