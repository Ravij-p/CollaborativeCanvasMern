const Canvas = require("../models/Canvas");
exports.saveCanvas = async (req, res) => {
  const { roomId, data } = req.body;
  await Canvas.findOneAndUpdate({ roomId }, { data }, { upsert: true });
  res.json({ success: true });
};
exports.loadCanvas = async (req, res) => {
  const canvas = await Canvas.findOne({ roomId: req.params.roomId });
  res.json(canvas?.data || {});
};
