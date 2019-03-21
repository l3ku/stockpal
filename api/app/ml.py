import json
import os
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score
from sklearn.linear_model import LinearRegression
from pandas.io.json import read_json
import datetime as dt

data = read_json('app/test.json')
X = data['date'].astype('int64').values.reshape(-1, 1)
Y = data['low']

X_train, X_test, y_train, y_test = train_test_split(X, Y, test_size=0.2)
clf = LinearRegression()
y_pred = clf.fit(X_train, y_train).predict(X_test)
r2_score = r2_score(y_test, y_pred)
print("r^2 on test data : %f" % r2_score)
