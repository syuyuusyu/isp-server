/*
 Navicat Premium Data Transfer

 Source Server         : local
 Source Server Type    : MySQL
 Source Server Version : 50718
 Source Host           : 127.0.0.1
 Source Database       : isp

 Target Server Type    : MySQL
 Target Server Version : 50718
 File Encoding         : utf-8

 Date: 02/11/2018 11:02:55 AM
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
--  Table structure for `t_invoke_info`
-- ----------------------------
DROP TABLE IF EXISTS `t_invoke_info`;
CREATE TABLE `t_invoke_info` (
  `id` int(4) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `descrption` varchar(200) DEFAULT NULL,
  `method` varchar(10) DEFAULT NULL,
  `url` varchar(200) DEFAULT NULL,
  `head` text,
  `body` text,
  `parseFun` text,
  `orginalResult` longtext,
  `next` varchar(50) DEFAULT NULL,
  `isSave` char(1) DEFAULT NULL,
  `saveEntityId` int(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;

SET FOREIGN_KEY_CHECKS = 1;



/*
 Navicat Premium Data Transfer

 Source Server         : local
 Source Server Type    : MySQL
 Source Server Version : 50718
 Source Host           : 127.0.0.1
 Source Database       : isp

 Target Server Type    : MySQL
 Target Server Version : 50718
 File Encoding         : utf-8

 Date: 02/11/2018 11:03:32 AM
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
--  Table structure for `menu`
-- ----------------------------
DROP TABLE IF EXISTS `menu`;
CREATE TABLE `menu` (
  `id` int(4) NOT NULL,
  `parent_id` int(4) DEFAULT NULL,
  `hierachy` int(4) DEFAULT NULL,
  `name` varchar(20) DEFAULT NULL,
  `text` varchar(50) DEFAULT NULL,
  `path` varchar(50) DEFAULT NULL,
  `is_leaf` char(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
--  Records of `menu`
-- ----------------------------
BEGIN;
INSERT INTO `menu` VALUES ('1', '-1', '0', 'root', 'root', null, '0'), ('2', '1', '1', 'system', '系统设置', null, '0'), ('3', '2', '2', 'invoke', '接口调用配置', '/invoke', '1'), ('4', '1', '1', 'config', '配置', null, '0'), ('5', '4', '2', 'subcon', '配置子1', null, '1');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
