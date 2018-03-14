# Host: localhost  (Version 5.7.17-log)
# Date: 2018-03-14 15:31:43
# Generator: MySQL-Front 6.0  (Build 2.20)


#
# Structure for table "comment"
#

CREATE TABLE `comment` (
  `id` smallint(6) unsigned NOT NULL AUTO_INCREMENT,
  `titleid` smallint(6) unsigned NOT NULL,
  `user` varchar(20) NOT NULL,
  `comment` text CHARACTER SET utf8mb4 NOT NULL,
  `date` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;

#
# Structure for table "question"
#

CREATE TABLE `question` (
  `id` smallint(6) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `content` text,
  `user` varchar(20) NOT NULL,
  `date` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=16 DEFAULT CHARSET=utf8;

#
# Structure for table "user"
#

CREATE TABLE `user` (
  `id` smallint(6) NOT NULL AUTO_INCREMENT,
  `user` varchar(20) NOT NULL,
  `pass` char(40) NOT NULL,
  `email` varchar(100) NOT NULL,
  `sex` varchar(10) NOT NULL,
  `birthday` date NOT NULL,
  `date` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8;
