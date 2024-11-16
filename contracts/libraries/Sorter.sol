// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

library Sorter {
    function quickSort(uint[] memory arr, int left, int right) internal pure {
        int i = left;
        int j = right;
        if (i == j) return;
        uint pivot = arr[uint(left + (right - left) / 2)];
        while (i <= j) {
            while (arr[uint(i)] < pivot) i++;
            while (pivot < arr[uint(j)]) j--;
            if (i <= j) {
                (arr[uint(i)], arr[uint(j)]) = (arr[uint(j)], arr[uint(i)]);
                i++;
                j--;
            }
        }
        if (left < j)
            quickSort(arr, left, j);
        if (i < right)
            quickSort(arr, i, right);
    }

    function sort(uint[] memory data) internal pure returns (uint[] memory) {
        quickSort(data, int(0), int(data.length - 1));
        return data;
    }

       function quickSortIndices(uint[] memory indices, uint[] memory values, int left, int right) internal pure {
        int i = left;
        int j = right;
        if (i == j) return;
        uint pivot = values[indices[uint(left + (right - left) / 2)]];
        while (i <= j) {
            while (values[indices[uint(i)]] < pivot) i++;
            while (pivot < values[indices[uint(j)]]) j--;
            if (i <= j) {
                (indices[uint(i)], indices[uint(j)]) = (indices[uint(j)], indices[uint(i)]);
                i++;
                j--;
            }
        }
        if (left < j)
            quickSortIndices(indices, values, left, j);
        if (i < right)
            quickSortIndices(indices, values, i, right);
    }

    function sortIndicesByValues(uint[] memory indices, uint[] memory values) internal pure returns (uint[] memory) {
        quickSortIndices(indices, values, int(0), int(indices.length - 1));
        return indices;
    }
}