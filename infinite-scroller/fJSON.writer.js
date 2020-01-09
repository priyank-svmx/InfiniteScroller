var fs = require("fs");
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

var data = {};
data.table = [];
for (i = 0; i < 10000; i++) {
  var obj = {
    tagsList: ["abc", "test"],
    responseId: `a118A000000mvoTQAQ - ${i}`,
    questionId: `a128A0000017p4iQAA - ${i}`,
    questionExtId: "QB000001",
    question: `Text Question - ${i}`,
    qType: "Picklist",
    lastModifiedDate: "2019-12-11 05:24:34",
    createdBy: "User User"
  };
  data.table.push(obj);
}
fs.writeFile("DATA.json", JSON.stringify(data), function(err) {
  if (err) throw err;
  console.log("complete");
});
