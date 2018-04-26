module.exports = {
    "extends": "airbnb",
    "parser": "babel-eslint",
    "env": {
      "browser": true
    },
    "plugins": [
        "react",
        "jsx-a11y",
        "import"
    ],
    "rules": {
        // enable additional rules
        // override default options for rules from base configurations
        "jsx-quotes": ["error", "prefer-single"],
        "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }],
        "semi": [2, "never"],
        // disable rules from base configurations
        "linebreak-style": 0,
        "max-len": 0,
        "react/no-unused-prop-types": 0,
        "react/jsx-no-target-blank": 0,
        "import/no-unresolved": 0,
        "import/extensions": 0,
        "import/no-extraneous-dependencies": 0,
        "new-cap": 0,
        "class-methods-use-this": 0,
        "operator-assignment": 0,
        "react/no-string-refs": 0,
        "arrow-body-style": 0,
        "no-param-reassign": 0,
        "arrow-parens": 0,
        "jsx-a11y/no-static-element-interactions": 0,
        "react/prefer-stateless-function": 0,
        "comma-dangle": ["error", "never"],
        "eol-last": 0,
        "react/forbid-prop-types": 0,
        "object-curly-newline": 0,
        'quotes': 0,
        'jsx-a11y/no-noninteractive-tabindex': 0,
        "import/prefer-default-export": 0,
        'react/require-default-props': 0,
    }
};
