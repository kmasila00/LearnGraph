'use strict';
var crypto = require('crypto');
var _ = require('lodash');
var Sequelize = require('sequelize');

var db = require('../_db');

module.exports = db.define('user', {
    firstname: {
        type: Sequelize.STRING
    },
    lastname: {
        type: Sequelize.STRING
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    email: {
        type: Sequelize.STRING,
    		unique: true,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    password: {
        type: Sequelize.STRING
    },
    salt: {
        type: Sequelize.STRING
    },
    isAdmin:{
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    passwordReset: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    facebook_id: {
        type: Sequelize.STRING
    },
    google_id: {
        type: Sequelize.STRING
    }
}, {
    instanceMethods: {
        sanitize: function () {
            return _.omit(this.toJSON(), ['password', 'salt']);
        },
        correctPassword: function (candidatePassword) {
            return this.Model.encryptPassword(candidatePassword, this.salt) === this.password;
        }
    },
    classMethods: {
        generateSalt: function () {
            return crypto.randomBytes(16).toString('base64');
        },
        encryptPassword: function (plainText, salt) {
            var hash = crypto.createHash('sha1');
            hash.update(plainText);
            hash.update(salt);
            return hash.digest('hex');
        }
    },
    hooks: {
		beforeCreate: function (user) {
			if (user.changed('password')) {
				user.salt = user.Model.generateSalt();
				user.password = user.Model.encryptPassword(user.password, user.salt);
			}
		},
		beforeUpdate: function(user) {
			if (user.changed('password')) {
				user.salt = user.Model.generateSalt();
				user.password = user.Model.encryptPassword(user.password, user.salt);
			}
		}
	}
});
