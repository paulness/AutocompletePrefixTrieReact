import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import PrefixTree from "./prefixTrie.js";
import D3CompatibleTree from "./prefixTrieForReactD3.js";
import Tree from "react-d3-tree";

class DownloadLink extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (!this.props.autoCompleteSearchTermAndResults) {
      return null;
    }

    return (
      <div>
        <button className="square" onClick={this.download.bind(this)}>
          Download AutoComplete List For Current Node
        </button>
        <br />
        <code>
          {JSON.stringify(this.props.autoCompleteSearchTermAndResults)}
        </code>
      </div>
    );
  }

  download() {
    var filename = this.props.autoCompleteSearchTermAndResults.searchTerm;
    var text = this.props.autoCompleteSearchTermAndResults.results.join("\n");

    var pom = document.createElement("a");
    pom.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    );
    pom.setAttribute("download", filename);

    if (document.createEvent) {
      var event = document.createEvent("MouseEvents");
      event.initEvent("click", true, true);
      pom.dispatchEvent(event);
    } else {
      pom.click();
    }
  }
}

class ReactTree extends React.Component {
  constructor(props) {
    super(props);

    var defaultNames = ["bill", "billy", "bob", "bo"];
    //add two initial values to tree
    var defaultPrefixTree = new PrefixTree();
    defaultNames.forEach(n => defaultPrefixTree.addWord(n));

    this.state = {
      value: defaultNames.join("\n"),
      myTree: new D3CompatibleTree(defaultPrefixTree),
      autoCompleteSearchTermAndResults: null
    };
  }

  handleChange(event) {
    //update the model
    this.setState({ value: event.target.value });
    var newTree = new PrefixTree();
    event.target.value.split("\n").map((item, index) => newTree.addWord(item));
    var svgCompatibleTree = new D3CompatibleTree(newTree);
    this.setState({ myTree: svgCompatibleTree });
  }

  handleNodeClick(node) {
    var priorNodes = this.state.myTree.getPriorNodes(node);
    var lettersBeforeNode = priorNodes
      .map(function(n) {
        return n.name;
      })
      .join("");

    var futureNodePaths = this.state.myTree.getFollowingNodePaths(node);
    var fullWords = futureNodePaths.map(function(np) {
      return (
        lettersBeforeNode +
        np
          .map(function(n) {
            return n.name;
          })
          .join("")
      );
    });

    var autoCompleteObj = {
      searchTerm: lettersBeforeNode + node.name,
      results: fullWords
    };
    this.setState({ autoCompleteSearchTermAndResults: autoCompleteObj });
  }

  render() {
    return (
      <div id="wrapper">
        <b>
          Type in words (press enter for new line), click on a node/circle to
          see the autocomplete search term and results
        </b>
        <br />
        <DownloadLink
          autoCompleteSearchTermAndResults={
            this.state.autoCompleteSearchTermAndResults
          }
        />
        <textarea
          value={this.state.value}
          onChange={this.handleChange.bind(this)}
        />
        <div class="treeContainer">
          <Tree
            onClick={n => this.handleNodeClick(n)}
            data={[this.state.myTree]}
            orientation={"vertical"}
            zoomable={true}
            collapsible={false}
            translate={{ x: document.documentElement.clientWidth / 2, y: 50 }}
          />
        </div>
      </div>
    );
  }
}

ReactDOM.render(<ReactTree />, document.getElementById("root"));
