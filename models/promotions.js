const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
var Currency = mongoose.Types.Currency;

var promotionSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	image: {
		type: String,
		required: true
	},
	label: {
		type: String,
		required: true
	},
	price: {
		type: Currency,
		required: true,
		min: 0
	},
	description: {
		type: String,
		required: true
	}

},
{
	timestamps: true
});


var Promotions = mongoose.model('Promotion', promotionSchema);

module.exports = Promotions;