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

SELECT id AS '아이디', COUNT(judge) AS '맞은 문제' 
FROM Score WHERE judge='맞았습니다!'
 GROUP BY id ORDER BY '맞은 문제' DESC

SELECT * FROM Users
SELECT * FROM Score
SELECT * FROM Users WHERE id='ab' AND pw = 'a'

INSERT INTO Score VALUES('comgong', '3', '#', '맞았습니다!');
INSERT INTO Score VALUES('comgong', '4', '#', '맞았습니다!');
INSERT INTO Score VALUES('comgong', '5', '#', '맞았습니다!');
INSERT INTO Score VALUES('comgong', '6', '#', '맞았습니다!');
INSERT INTO Score VALUES('comgong', '7', '#', '맞았습니다!');
INSERT INTO Score VALUES('comgong', '8', '#', '맞았습니다!');
INSERT INTO Score VALUES('comgong', '9', '#', '맞았습니다!');
INSERT INTO Score VALUES('comgong', '10', '#', '맞았습니다!');

delete fROM SCORE WHERE ID = 'PYW056'

/* DROP TABLES */
/*
DROP TABLE Users
DROP TABLE Rank
*/


CREATE TABLE algorithms(
	_type NVARCHAR(100) NOT NULL,
	name NVARCHAR(100),
	tableName NVARCHAR(100),
	content NVARCHAR(MAX)
)
INSERT INTO algorithms VALUES('title','', '', '알고리즘 레퍼런스')
INSERT INTO algorithms VALUES('sub','기본 알고리즘', 'basicAlgorithm', '')
INSERT INTO algorithms VALUES('sub','고급 알고리즘', 'advancedAlgorithm', '')
INSERT INTO algorithms VALUES('sub','안고급 알고리즘', 'notadvancedAlgorithm', '')
INSERT INTO algorithms VALUES('sub','안고급 알고리즘2', 'not2advancedAlgorithm', '')
INSERT INTO algorithms VALUES('content','', '', '알고리즘 레퍼런스 구현 중이에요')
GO
SELECT * FROM algorithms
SELECT * FROM basicAlgorithm

/* 
drop table algorithms
DELETE FROM algorithms;
DELETE FROM basicAlgorithm;
DELETE FROM algorithms WHERE _type = 'title';
DELETE FROM basicAlgorithm WHERE name = '완전탐색';
drop table basicAlgorithm
*/

CREATE TABLE basicAlgorithm(
	_type NVARCHAR(100) NOT NULL,
	name NVARCHAR(100),
	tableName NVARCHAR(100),
	content NVARCHAR(MAX)
)
INSERT INTO basicAlgorithm VALUES('title','', '', '기본 알고리즘')
INSERT INTO basicAlgorithm VALUES('sub','완전탐색','exhaustive','')
INSERT INTO basicAlgorithm VALUES('content','', '', '기본적인 알고리즘 좋아요')

GO

