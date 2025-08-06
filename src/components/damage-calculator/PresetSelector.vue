<template>
  <Card>
    <CardHeader>
      <CardTitle>Presets</CardTitle>
      <CardDescription>Save and load stat configurations</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <!-- Load Preset -->
      <div v-if="presets.length > 0">
        <Label>Load Preset</Label>
        <div class="flex gap-2 mt-2">
          <Select
            v-model="selectedPresetId"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a preset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem 
                v-for="preset in presets" 
                :key="preset.id"
                :value="preset.id"
              >
                {{ preset.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="destructive"
            size="icon"
            :disabled="!selectedPresetId"
            @click="handleDelete"
          >
            <Trash2 class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <!-- Save Preset -->
      <div>
        <Label htmlFor="preset-name">Save Current Configuration</Label>
        <div class="flex gap-2 mt-2">
          <Input
            id="preset-name"
            v-model="newPresetName"
            placeholder="Preset name"
            @keydown.enter="handleSave"
          />
          <Button
            :disabled="!newPresetName.trim()"
            @click="handleSave"
          >
            <Save class="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <!-- Import/Export -->
      <div class="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          @click="handleExport"
          :disabled="presets.length === 0"
        >
          <Download class="h-4 w-4 mr-2" />
          Export All
        </Button>
        <Button
          variant="outline"
          size="sm"
          @click="triggerImport"
        >
          <Upload class="h-4 w-4 mr-2" />
          Import
        </Button>
        <input
          ref="importInput"
          type="file"
          accept=".json"
          class="hidden"
          @change="handleImport"
        />
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DamageCalculatorPreset } from '@/stores/damageCalculator.store';
import { Download, Save, Trash2, Upload } from 'lucide-vue-next';
import { ref, watch } from 'vue';

interface Props {
  presets: DamageCalculatorPreset[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  save: [name: string];
  load: [id: string];
  delete: [id: string];
  import: [presets: DamageCalculatorPreset[]];
}>();

const selectedPresetId = ref<string>('');
const newPresetName = ref('');
const importInput = ref<HTMLInputElement>();

// Watch for preset selection changes
watch(selectedPresetId, (newId) => {
  if (newId) {
    emit('load', newId);
  }
});

const handleSave = () => {
  if (newPresetName.value.trim()) {
    emit('save', newPresetName.value.trim());
    newPresetName.value = '';
  }
};

const handleDelete = () => {
  if (selectedPresetId.value && confirm('Delete this preset?')) {
    emit('delete', selectedPresetId.value);
    selectedPresetId.value = '';
  }
};

const handleExport = () => {
  const data = JSON.stringify(props.presets, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'damage-calculator-presets.json';
  a.click();
  URL.revokeObjectURL(url);
};

const triggerImport = () => {
  importInput.value?.click();
};

const handleImport = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const presets = JSON.parse(e.target?.result as string);
      if (Array.isArray(presets)) {
        emit('import', presets);
      }
    } catch (error) {
      console.error('Failed to import presets:', error);
      alert('Failed to import presets. Please check the file format.');
    }
  };
  reader.readAsText(file);
  target.value = '';
};
</script>