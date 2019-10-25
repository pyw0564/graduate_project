use GraduateProject;
GO

/* CREATE TABLES */
CREATE TABLE Users(
	id nvarchar(25) NOT NULL,
	pw nvarchar(25) NOT NULL,
	name nvarchar(25) NOT NULL,
	phone nvarchar(25) NOT NULL,
	PRIMARY KEY(id)
)
CREATE TABLE Rank(
	id nvarchar(25) NOT NULL,
	p1 int,
	p2 int,
	p3 int,
	PRIMARY KEY(id)
)
/* SELECT TABLES */

SELECT * FROM Users
SELECT * FROM Rank
SELECT * FROM Users WHERE id='ab' AND pw = 'a'

/* DROP TABLES */
/*
DROP TABLE Users
DROP TABLE Rank
*/


drop table algorithms

CREATE TABLE algorithms(
	_type NVARCHAR(100) NOT NULL,
	name NVARCHAR(100),
	tableName NVARCHAR(100),
	content NVARCHAR(MAX)
)

DELETE FROM algorithms;
DELETE FROM algorithms WHERE _type = 'content';

INSERT INTO algorithms VALUES('sub','기본 알고리즘', 'basicAlgorithm', '')
INSERT INTO algorithms VALUES('sub','고급 알고리즘', 'advancedAlgorithm', '')
INSERT INTO algorithms VALUES('sub','안고급 알고리즘', 'notadvancedAlgorithm', '')
INSERT INTO algorithms VALUES('sub','안고급 알고리즘2', 'not2advancedAlgorithm', '')

GO


drop table basicAlgorithm
CREATE TABLE basicAlgorithm(
	_type NVARCHAR(100) NOT NULL,
	name NVARCHAR(100),
	tableName NVARCHAR(100),
	content NVARCHAR(MAX)
)
INSERT INTO basicAlgorithm VALUES('sub','완전탐색','exhaustive','')
GO


drop table exhaustive
CREATE TABLE exhaustive(
	_type NVARCHAR(100) NOT NULL,
	name NVARCHAR(100),
	tableName NVARCHAR(100),
	content NVARCHAR(MAX)
)

