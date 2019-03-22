import json
import os
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score
from sklearn.preprocessing import MinMaxScaler
from keras.models import Sequential
from keras.layers import Dense, Dropout, LSTM, Flatten
from pandas.io.json import read_json
import pandas as pd
import datetime as dt
import matplotlib.pyplot as plt
from math import floor

data = read_json('test.json')
data.sort_values('date')
stock_prices = data['close'].values.reshape(-1, 1)

scaler = MinMaxScaler(feature_range=(0, 1))
stock_prices = scaler.fit_transform(stock_prices)

# We will split the data so that 80% of it is used for training, and 20% for testing.
four_fifths = floor(0.8*len(stock_prices))
stock_prices_train = stock_prices[:four_fifths]
stock_prices_test = stock_prices[four_fifths:]


# In both splits, we will use windows of a certain length to predict the succeeding values
window_size = 100
X_train = []
y_train = []
for i in range(len(stock_prices_train)-window_size):
  X_train.append(stock_prices_train[i:i+window_size-1])
  y_train.append(stock_prices_train[i+window_size-1][0])
X_train = np.array(X_train)
y_train = np.array(y_train)

X_test = []
y_test = []
for i in range(len(stock_prices_test)-window_size):
  X_test.append(stock_prices_test[i:i+window_size-1])
  y_test.append(stock_prices_test[i+window_size-1][0])
X_test = np.array(X_test)
y_test = np.array(y_test)

print(X_train.shape)
print(y_train.shape)
print(X_test.shape)
print(y_test.shape)

# create and fit the LSTM network
model = Sequential()
model.add(LSTM(units=10, return_sequences=True, input_shape=(X_train.shape[1], 1)))
model.add(LSTM(units=10))
model.add(Dense(1))
model.summary()

model.compile(loss='mean_squared_error', optimizer='adam')
model.fit(X_train, y_train, epochs=5, batch_size=1, verbose=3, validation_data=(X_test, y_test))

# Now let's use the model to predict. Let's start with the 99 last values, and then continue as long as asked...
how_far_to_the_future = 365
last_values = stock_prices[-100:]
predictions = []
for day in range(how_far_to_the_future):
  y_pred = model.predict(last_values)
  last_values.pop()
  last_values.append(y_pred)
  predictions.append(scaler.inverse_transform(y_pred))

# Show the predicted values as a continum from the original ones
X_show = np.append(data.index, list(range(data.index+1,how_far_to_the_future)))
y_show = np.append(y, np.array(predictions))

plt.plot(X_show, y_show)
plt.show()


