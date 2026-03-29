import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { theme } from '../../theme';
import GlowButton from '../../components/GlowButton';
import DeptBadge from '../../components/DeptBadge';
import { Equipment, PipelineStep } from '../../types';

interface ReviewScreenProps {
  equipment: Equipment[];
  onEquipmentUpdate: (equipment: Equipment[]) => void;
  onNavigate: (step: PipelineStep) => void;
}

type SortBy = 'name' | 'dept' | 'qty';

export default function ReviewScreen({
  equipment,
  onEquipmentUpdate,
  onNavigate,
}: ReviewScreenProps) {
  const [searchText, setSearchText] = useState('');
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const departments = Array.from(
    new Set(equipment.map((e) => e.department))
  );

  const filteredEquipment = equipment
    .filter((e) => {
      const matchesSearch = e.name
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const matchesDept = !selectedDept || e.department === selectedDept;
      return matchesSearch && matchesDept;
    });

  const sortedEquipment = [...filteredEquipment].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'dept':
        return a.department.localeCompare(b.department);
      case 'qty':
        return b.quantity - a.quantity;
      default:
        return 0;
    }
  });

  const handleDeleteItem = (id: string) => {
    Alert.alert('Delete Item?', 'This cannot be undone', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          onEquipmentUpdate(equipment.filter((e) => e.id !== id));
        },
      },
    ]);
  };

  const handleEditQuantity = (item: Equipment) => {
    setEditingId(item.id);
    setEditValue(item.quantity.toString());
  };

  const handleSaveQuantity = (id: string) => {
    const newQty = parseInt(editValue, 10);
    if (isNaN(newQty) || newQty <= 0) {
      Alert.alert('Invalid', 'Quantity must be a positive number');
      return;
    }

    onEquipmentUpdate(
      equipment.map((e) =>
        e.id === id ? { ...e, quantity: newQty } : e
      )
    );
    setEditingId(null);
  };

  const handleContinue = () => {
    if (equipment.length === 0) {
      Alert.alert('No Equipment', 'Please import equipment first');
      return;
    }
    onNavigate('validate');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search equipment..."
            placeholderTextColor={theme.colors.textTertiary}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Department filter */}
        {departments.map((dept) => (
          <TouchableOpacity
            key={dept}
            style={[
              styles.filterChip,
              selectedDept === dept && styles.filterChipActive,
            ]}
            onPress={() =>
              setSelectedDept(selectedDept === dept ? null : dept)
            }
          >
            <Text
              style={[
                styles.filterChipText,
                selectedDept === dept && styles.filterChipTextActive,
              ]}
            >
              {dept}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort options */}
      <View style={styles.sortBar}>
        <Text style={styles.sortLabel}>Sort: </Text>
        {(['name', 'dept', 'qty'] as SortBy[]).map((sort) => (
          <TouchableOpacity
            key={sort}
            style={[
              styles.sortOption,
              sortBy === sort && styles.sortOptionActive,
            ]}
            onPress={() => setSortBy(sort)}
          >
            <Text
              style={[
                styles.sortOptionText,
                sortBy === sort && styles.sortOptionTextActive,
              ]}
            >
              {sort === 'qty' ? 'Qty' : sort.charAt(0).toUpperCase() + sort.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Equipment List */}
      <FlatList
        data={sortedEquipment}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.equipmentItem}>
            <View style={styles.itemContent}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{item.name}</Text>
                <DeptBadge department={item.department} size="sm" />
              </View>

              <View style={styles.itemDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Weight:</Text>
                  <Text style={styles.detailValue}>{item.baseWeight} kg</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Complexity:</Text>
                  <Text style={styles.detailValue}>
                    {'★'.repeat(item.complexity)}{'☆'.repeat(5 - item.complexity)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Qty:</Text>
                  {editingId === item.id ? (
                    <View style={styles.qtyEditContainer}>
                      <TextInput
                        style={styles.qtyInput}
                        keyboardType="numeric"
                        value={editValue}
                        onChangeText={setEditValue}
                      />
                      <TouchableOpacity
                        onPress={() => handleSaveQuantity(item.id)}
                        style={styles.saveButton}
                      >
                        <Text style={styles.saveButtonText}>✓</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleEditQuantity(item)}
                      style={styles.qtyDisplay}
                    >
                      <Text style={styles.detailValue}>{item.quantity}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {item.notes && (
                <Text style={styles.itemNotes}>{item.notes}</Text>
              )}
            </View>

            <TouchableOpacity
              onPress={() => handleDeleteItem(item.id)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
      />

      {/* Summary & Actions */}
      <View style={styles.footer}>
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Items:</Text>
            <Text style={styles.summaryValue}>{equipment.length}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Qty:</Text>
            <Text style={styles.summaryValue}>
              {equipment.reduce((sum, e) => sum + e.quantity, 0)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Departments:</Text>
            <Text style={styles.summaryValue}>{departments.length}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <GlowButton
            title="← Import More"
            variant="secondary"
            fullWidth
            onPress={() => onNavigate('import')}
          />
          <GlowButton
            title="Continue →"
            variant="primary"
            fullWidth
            onPress={handleContinue}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  filterBar: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderDim,
    paddingVertical: theme.spacing[2],
  },
  filterContent: {
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[2],
  },
  searchContainer: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing[3],
    minWidth: 200,
  },
  searchInput: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.families.monospace,
    paddingVertical: theme.spacing[2],
  },
  filterChip: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing[1],
    paddingHorizontal: theme.spacing[3],
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryLight,
  },
  filterChipText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
    fontWeight: theme.typography.weights.semibold,
  },
  filterChipTextActive: {
    color: theme.colors.textInverse,
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderDim,
    gap: theme.spacing[2],
  },
  sortLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
    fontWeight: theme.typography.weights.semibold,
  },
  sortOption: {
    paddingVertical: theme.spacing[1],
    paddingHorizontal: theme.spacing[2],
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  sortOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryLight,
  },
  sortOptionText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
    fontWeight: theme.typography.weights.semibold,
  },
  sortOptionTextActive: {
    color: theme.colors.textInverse,
  },
  listContent: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
  },
  equipmentItem: {
    backgroundColor: theme.colors.surfacePrimary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    marginVertical: theme.spacing[2],
    padding: theme.spacing[3],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing[2],
    gap: theme.spacing[2],
  },
  itemName: {
    flex: 1,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    fontFamily: theme.typography.families.monospace,
  },
  itemDetails: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[2],
    marginBottom: theme.spacing[2],
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: theme.spacing[1],
  },
  detailLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
  },
  detailValue: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.primary,
    fontFamily: theme.typography.families.monospace,
    fontWeight: theme.typography.weights.bold,
  },
  qtyEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
  },
  qtyInput: {
    width: 40,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing[1],
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.families.monospace,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: theme.colors.success,
    borderRadius: theme.borderRadius.md,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: theme.colors.textInverse,
    fontWeight: theme.typography.weights.bold,
  },
  qtyDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemNotes: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textTertiary,
    fontFamily: theme.typography.families.monospace,
    fontStyle: 'italic',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  deleteButtonText: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.danger,
    fontWeight: theme.typography.weights.bold,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderDim,
    backgroundColor: theme.colors.surfaceSecondary,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[4],
    gap: theme.spacing[3],
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
  },
  summaryValue: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    fontFamily: theme.typography.families.monospace,
  },
  actions: {
    gap: theme.spacing[2],
  },
});
