const mongoose = require('mongoose');

// This model is for all component fields, for eg haversack must have "this and that"
const ComponentFieldSchema = new mongoose.Schema(
    {
        field_description: {
            type: String,
            required: true
        },
        field_score: {
            type: Number,
            required: true,
            default: 1
        }
    },
    {
        collection: "uniform_components"
    }
);

// This model is for all uniform components. for eg (Hair, Field Service Cap, Haversack, etc...)
const UniformComponentSchema = new mongoose.Schema(
    {
        component_name: {
            type: String,
            required: true
        },
        total_score: {
            type: Number,
            required: true
        },
        components_fields: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ComponentField',
            required: true
        }]
    },
    {
        collection: "uniform_categories"
    }
);

const UniformComponent = mongoose.model('UniformComponent', UniformComponentSchema) || mongoose.models.UniformComponent;
const ComponentField = mongoose.model('ComponentField', ComponentFieldSchema) || mongoose.models.ComponentField;
module.exports = { UniformComponent, ComponentField };