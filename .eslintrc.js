module.exports = {
    "extends": [
        "plugin:vue/base"
    ],
    "globals": {
        "localStorage": true,
        "fetch": true
    },
    "rules": {
        "vue/no-unused-components": "off",
        "vue/return-in-computed-property": "off",
        "vue/order-in-components": "off",
        "vue/require-prop-types": "off",
        "vue/require-default-prop": "off",
        "vue/no-template-shadow": "off",
        "vue/no-deprecated-slot-attribute": "off",
        "vue/require-valid-default-prop": "off",
        "vue/require-explicit-emits": "off",
        "vue/this-in-template": "off",
        "vue/no-deprecated-destroyed-lifecycle": "off",
        "vue/no-parsing-error": "off"
    }
};