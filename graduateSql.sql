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

SELECT id AS '���̵�', COUNT(judge) AS '���� ����' 
FROM Score WHERE judge='�¾ҽ��ϴ�!'
 GROUP BY id ORDER BY '���� ����' DESC

SELECT * FROM Users
SELECT * FROM Score
SELECT * FROM Users WHERE id='ab' AND pw = 'a'

INSERT INTO Score VALUES('comgong', '3', '#', '�¾ҽ��ϴ�!');
INSERT INTO Score VALUES('comgong', '4', '#', '�¾ҽ��ϴ�!');
INSERT INTO Score VALUES('comgong', '5', '#', '�¾ҽ��ϴ�!');
INSERT INTO Score VALUES('comgong', '6', '#', '�¾ҽ��ϴ�!');
INSERT INTO Score VALUES('comgong', '7', '#', '�¾ҽ��ϴ�!');
INSERT INTO Score VALUES('comgong', '8', '#', '�¾ҽ��ϴ�!');
INSERT INTO Score VALUES('comgong', '9', '#', '�¾ҽ��ϴ�!');
INSERT INTO Score VALUES('comgong', '10', '#', '�¾ҽ��ϴ�!');

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
INSERT INTO algorithms VALUES('title','', '', '�˰��� ���۷���')
INSERT INTO algorithms VALUES('sub','�⺻ �˰���', 'basicAlgorithm', '')
INSERT INTO algorithms VALUES('sub','��� �˰���', 'advancedAlgorithm', '')
INSERT INTO algorithms VALUES('sub','�Ȱ�� �˰���', 'notadvancedAlgorithm', '')
INSERT INTO algorithms VALUES('sub','�Ȱ�� �˰���2', 'not2advancedAlgorithm', '')
INSERT INTO algorithms VALUES('content','', '', '�˰��� ���۷��� ���� ���̿���')
GO
SELECT * FROM algorithms
SELECT * FROM basicAlgorithm

/* 
drop table algorithms
DELETE FROM algorithms;
DELETE FROM basicAlgorithm;
DELETE FROM algorithms WHERE _type = 'title';
DELETE FROM basicAlgorithm WHERE name = '����Ž��';
drop table basicAlgorithm
*/

CREATE TABLE basicAlgorithm(
	_type NVARCHAR(100) NOT NULL,
	name NVARCHAR(100),
	tableName NVARCHAR(100),
	content NVARCHAR(MAX)
)
INSERT INTO basicAlgorithm VALUES('title','', '', '�⺻ �˰���')
INSERT INTO basicAlgorithm VALUES('sub','����Ž��','exhaustive','')
INSERT INTO basicAlgorithm VALUES('content','', '', '�⺻���� �˰��� ���ƿ�')

GO

