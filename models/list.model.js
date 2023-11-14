const { Schema, model } = require("mongoose");

const listSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
  default: [],
});

const List = model("List", listSchema);
module.exports = List;
