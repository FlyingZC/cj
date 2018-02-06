/**
 * 产品层全局空间
 */
var product = product || {};

/**
 * 命名空间方法
 */
product.namespace = function() {
	var a = arguments,
		o = null,
		i, j, pkgFragments, rt;
	for(i = 0; i < a.length; i = i + 1) {
		pkgFragments = a[i].split(".");
		rt = pkgFragments[0];
		eval('if (typeof ' + rt + ' == "undefined"){' + rt + ' = {};} o = ' + rt + ';');
		for(j = 1; j < pkgFragments.length; j = j + 1) {
			o[pkgFragments[j]] = o[pkgFragments[j]] || {};
			o = o[pkgFragments[j]];
		}
	}
	return o;
};

/**
 * 因为采用了命名空间 会使得类在使用时，需要书写很长的类名。
 * 此别名方法可以为长类名定义一个短名字
 * 如:var Logger = product.alias(efwk.common.Logger);
 * 
 * @param {Object} importObject
 */
product.alias = function(importObject) {
	if((typeof importObject) === 'undefined') {
		throw new Error('导入的类undefined' + importObject);
	}
	if((typeof importObject) === 'null') {
		throw new Error('导入的类为null' + importObject);
	}
	if((typeof importObject) !== 'object') {
		throw new Error('暂时不支持非对象类型的导入');
	}
	return importObject;
};

product.create = function(proto) {
	function Dummy() {}
	Dummy.prototype = proto;
	return new Dummy();
};

/**
 * 便捷写法
 */
product.ns = product.namespace;
product.ns("efwk.common");