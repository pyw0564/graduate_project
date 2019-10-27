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
CREATE TABLE Score(
	id nvarchar(25) NOT NULL,
	problem int,
	code nvarchar(MAX),
	judge nvarchar(25),
	PRIMARY KEY(id, problem)
)
/* SELECT TABLES */

IF NOT EXISTS(SELECT * FROM Rank WHERE id='pyw0564' AND problem=1)
  BEGIN
    INSERT INTO Rank(id,problem,code,judge)
    VALUES('pyw0564',1,'#include <stdio.h>

int main(){
  int a,b;
  scanf("%d %d", &a, &b);
  printf("%d", a + b);

}',null)
  END

SELECT * FROM Users
SELECT * FROM Score
SELECT * FROM Users WHERE id='ab' AND pw = 'a'
INSERT INTO Score(id) VALUES('pyw0564')
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

INSERT INTO algorithms VALUES('sub','�⺻ �˰���', 'basicAlgorithm', '')
INSERT INTO algorithms VALUES('sub','��� �˰���', 'advancedAlgorithm', '')
INSERT INTO algorithms VALUES('sub','�Ȱ�� �˰���', 'notadvancedAlgorithm', '')
INSERT INTO algorithms VALUES('sub','�Ȱ�� �˰���2', 'not2advancedAlgorithm', '')

GO


drop table basicAlgorithm
CREATE TABLE basicAlgorithm(
	_type NVARCHAR(100) NOT NULL,
	name NVARCHAR(100),
	tableName NVARCHAR(100),
	content NVARCHAR(MAX)
)
INSERT INTO basicAlgorithm VALUES('sub','����Ž��','exhaustive','')
GO


drop table exhaustive
CREATE TABLE exhaustive(
	_type NVARCHAR(100) NOT NULL,
	name NVARCHAR(100),
	tableName NVARCHAR(100),
	content NVARCHAR(MAX)
)

